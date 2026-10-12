import type { Request, Response } from "express";
import watchingActions from "../../src/modules/watching/watchingActions";
import watchingRepository from "../../src/modules/watching/watchingRepository";

jest.mock("../../src/modules/watching/watchingRepository");

const mockedRepository = watchingRepository as jest.Mocked<
  typeof watchingRepository
>;

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

describe("watchingActions.toggleMediaWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      params: { id: "10" },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleMediaWatched(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("marque le média comme vu s'il ne l'est pas", async () => {
    mockedRepository.isMediaWatched.mockResolvedValue([]);

    const req = {
      params: { id: "10" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleMediaWatched(req, res, jest.fn());

    expect(mockedRepository.isMediaWatched).toHaveBeenCalledWith(1, 10);
    expect(mockedRepository.markMediaAsWatched).toHaveBeenCalledWith(1, 10);
    expect(mockedRepository.unmarkMediaAsWatched).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ watched: true });
  });

  test("retire le média des médias vus s'il est déjà vu", async () => {
    mockedRepository.isMediaWatched.mockResolvedValue([{}] as never);

    const req = {
      params: { id: "10" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleMediaWatched(req, res, jest.fn());

    expect(mockedRepository.isMediaWatched).toHaveBeenCalledWith(1, 10);
    expect(mockedRepository.unmarkMediaAsWatched).toHaveBeenCalledWith(1, 10);
    expect(mockedRepository.markMediaAsWatched).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ watched: false });
  });
});

describe("watchingActions.toggleSeriesWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      params: { id: "20" },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeriesWatched(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockedRepository.isFullyWatched).not.toHaveBeenCalled();
  });

  test("marque tous les épisodes d'une série comme vus", async () => {
    mockedRepository.isFullyWatched.mockResolvedValue(false);
    mockedRepository.readSeriesEpisodeIds.mockResolvedValue([101, 102, 103]);

    const req = {
      params: { id: "20" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeriesWatched(req, res, jest.fn());

    expect(mockedRepository.isFullyWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.markSeriesAsWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.unmarkSeriesAsWatched).not.toHaveBeenCalled();
    expect(mockedRepository.readSeriesEpisodeIds).toHaveBeenCalledWith(20);

    expect(res.json).toHaveBeenCalledWith({
      watched: true,
      episodeIds: [101, 102, 103],
    });
  });

  test("retire tous les épisodes d'une série des épisodes vus", async () => {
    mockedRepository.isFullyWatched.mockResolvedValue(true);
    mockedRepository.readSeriesEpisodeIds.mockResolvedValue([101, 102, 103]);

    const req = {
      params: { id: "20" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeriesWatched(req, res, jest.fn());

    expect(mockedRepository.isFullyWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.unmarkSeriesAsWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.markSeriesAsWatched).not.toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      watched: false,
      episodeIds: [101, 102, 103],
    });
  });
});

describe("watchingActions.toggleSeasonWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      params: { id: "30" },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeasonWatched(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockedRepository.isSeasonWatched).not.toHaveBeenCalled();
  });

  test("marque tous les épisodes d'une saison comme vus", async () => {
    mockedRepository.isSeasonWatched.mockResolvedValue(false);
    mockedRepository.readSeriesIdFromSeason.mockResolvedValue(20);
    mockedRepository.isFullyWatched.mockResolvedValue(false);

    const req = {
      params: { id: "30" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeasonWatched(req, res, jest.fn());

    expect(mockedRepository.isSeasonWatched).toHaveBeenCalledWith(1, 30);
    expect(mockedRepository.markSeasonAsWatched).toHaveBeenCalledWith(1, 30);
    expect(mockedRepository.unmarkSeasonAsWatched).not.toHaveBeenCalled();
    expect(mockedRepository.readSeriesIdFromSeason).toHaveBeenCalledWith(30);
    expect(mockedRepository.isFullyWatched).toHaveBeenCalledWith(1, 20);

    expect(res.json).toHaveBeenCalledWith({
      watched: true,
      mediaId: 20,
      seriesFullyWatched: false,
    });
  });

  test("retire tous les épisodes d'une saison des épisodes vus", async () => {
    mockedRepository.isSeasonWatched.mockResolvedValue(true);
    mockedRepository.readSeriesIdFromSeason.mockResolvedValue(20);
    mockedRepository.isFullyWatched.mockResolvedValue(true);

    const req = {
      params: { id: "30" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleSeasonWatched(req, res, jest.fn());

    expect(mockedRepository.isSeasonWatched).toHaveBeenCalledWith(1, 30);
    expect(mockedRepository.unmarkSeasonAsWatched).toHaveBeenCalledWith(1, 30);
    expect(mockedRepository.markSeasonAsWatched).not.toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      watched: false,
      mediaId: 20,
      seriesFullyWatched: true,
    });
  });
});

describe("watchingActions.toggleEpisodeWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      params: { id: "40" },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleEpisodeWatched(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockedRepository.isEpisodeWatched).not.toHaveBeenCalled();
  });

  test("marque l'épisode comme vu", async () => {
    mockedRepository.isEpisodeWatched.mockResolvedValue([]);
    mockedRepository.readSeriesIdFromEpisode.mockResolvedValue(20);
    mockedRepository.isFullyWatched.mockResolvedValue(false);

    const req = {
      params: { id: "40" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleEpisodeWatched(req, res, jest.fn());

    expect(mockedRepository.isEpisodeWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.markEpisodeAsWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.unmarkEpisodeAsWatched).not.toHaveBeenCalled();
    expect(mockedRepository.readSeriesIdFromEpisode).toHaveBeenCalledWith(40);
    expect(mockedRepository.isFullyWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.unmarkMediaAsWatched).toHaveBeenCalledWith(1, 20);

    expect(res.json).toHaveBeenCalledWith({
      watched: true,
      mediaId: 20,
      seriesFullyWatched: false,
    });
  });

  test("ajoute la série aux médias vus lorsque tous ses épisodes sont vus", async () => {
    mockedRepository.isEpisodeWatched.mockResolvedValue([]);
    mockedRepository.readSeriesIdFromEpisode.mockResolvedValue(20);
    mockedRepository.isFullyWatched.mockResolvedValue(true);
    mockedRepository.isMediaWatched.mockResolvedValue([]);

    const req = { params: { id: "40" }, user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleEpisodeWatched(req, res, jest.fn());

    expect(mockedRepository.isEpisodeWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.markEpisodeAsWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.readSeriesIdFromEpisode).toHaveBeenCalledWith(40);
    expect(mockedRepository.isFullyWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.isMediaWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.markMediaAsWatched).toHaveBeenCalledWith(1, 20);
    expect(mockedRepository.unmarkMediaAsWatched).not.toHaveBeenCalled();

    expect(res.json).toHaveBeenCalledWith({
      watched: true,
      mediaId: 20,
      seriesFullyWatched: true,
    });
  });

  test("retire l'épisode des épisodes vus", async () => {
    mockedRepository.isEpisodeWatched.mockResolvedValue([{}] as never);
    mockedRepository.readSeriesIdFromEpisode.mockResolvedValue(20);
    mockedRepository.isFullyWatched.mockResolvedValue(false);

    const req = {
      params: { id: "40" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.toggleEpisodeWatched(req, res, jest.fn());

    expect(mockedRepository.isEpisodeWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.unmarkEpisodeAsWatched).toHaveBeenCalledWith(1, 40);
    expect(mockedRepository.markEpisodeAsWatched).not.toHaveBeenCalled();
    expect(mockedRepository.unmarkMediaAsWatched).toHaveBeenCalledWith(1, 20);

    expect(res.json).toHaveBeenCalledWith({
      watched: false,
      mediaId: 20,
      seriesFullyWatched: false,
    });
  });
});

describe("watchingActions.readMediaWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await watchingActions.readMediaWatched(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockedRepository.readMediaWatched).not.toHaveBeenCalled();
  });

  test("renvoie les ids des médias vus", async () => {
    mockedRepository.readMediaWatched.mockResolvedValue([10, 20, 30]);

    const req = {
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.readMediaWatched(req, res, jest.fn());

    expect(mockedRepository.readMediaWatched).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith([10, 20, 30]);
  });
});

describe("watchingActions.readEpisodeWatched", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await watchingActions.readEpisodeWatched(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockedRepository.readEpisodeWatched).not.toHaveBeenCalled();
  });

  test("renvoie les ids des épisodes vus", async () => {
    mockedRepository.readEpisodeWatched.mockResolvedValue([101, 102, 103]);

    const req = {
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await watchingActions.readEpisodeWatched(req, res, jest.fn());

    expect(mockedRepository.readEpisodeWatched).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith([101, 102, 103]);
  });
});
