import type { Request, Response } from "express";
import mediaRepository from "../../src/modules/media/mediaRepository";
import trackActions from "../../src/modules/track/trackActions";
import trackRepository from "../../src/modules/track/trackRepository";

jest.mock("../../src/modules/track/trackRepository");
jest.mock("../../src/modules/media/mediaRepository");

const mockedTrackRepository = trackRepository as jest.Mocked<
  typeof trackRepository
>;
const mockedMediaRepository = mediaRepository as jest.Mocked<
  typeof mediaRepository
>;

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

const track = { mediaId: 10, isFavorite: true, isInWatchlist: false };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("trackActions.browse", () => {
  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await trackActions.browse(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedTrackRepository.readAll).not.toHaveBeenCalled();
  });

  test("renvoie les favoris et la watchlist de l'utilisateur", async () => {
    mockedTrackRepository.readAll.mockResolvedValue([track]);

    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    await trackActions.browse(req, res, jest.fn());

    expect(mockedTrackRepository.readAll).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith([track]);
  });
});

describe.each([
  ["toggleFavorite", "toggleFavorite"],
  ["toggleWatchlist", "toggleWatchlist"],
] as const)("trackActions.%s", (actionName, repositoryMethod) => {
  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = { params: { id: "10" } } as unknown as Request;
    const res = createResponse();

    await trackActions[actionName](req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedTrackRepository[repositoryMethod]).not.toHaveBeenCalled();
  });

  test.each(["abc", "0", "-3", "1.5"])(
    "renvoie 400 pour l'identifiant invalide %s",
    async (id) => {
      const req = { params: { id }, user: { id: 1 } } as unknown as Request;
      const res = createResponse();

      await trackActions[actionName](req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockedMediaRepository.read).not.toHaveBeenCalled();
      expect(mockedTrackRepository[repositoryMethod]).not.toHaveBeenCalled();
    },
  );

  test("renvoie 404 si le média n'existe pas", async () => {
    mockedMediaRepository.read.mockResolvedValue(null);

    const req = {
      params: { id: "999" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await trackActions[actionName](req, res, jest.fn());

    expect(mockedMediaRepository.read).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(mockedTrackRepository[repositoryMethod]).not.toHaveBeenCalled();
  });

  test("bascule l'état et renvoie le suivi à jour", async () => {
    mockedMediaRepository.read.mockResolvedValue({ ID: 10 } as never);
    mockedTrackRepository[repositoryMethod].mockResolvedValue(track);

    const req = { params: { id: "10" }, user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    await trackActions[actionName](req, res, jest.fn());

    expect(mockedTrackRepository[repositoryMethod]).toHaveBeenCalledWith(1, 10);
    expect(res.json).toHaveBeenCalledWith(track);
  });

  test("transmet l'erreur au gestionnaire d'erreurs", async () => {
    const failure = new Error("database down");
    mockedMediaRepository.read.mockRejectedValue(failure);

    const req = { params: { id: "10" }, user: { id: 1 } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    await trackActions[actionName](req, res, next);

    expect(next).toHaveBeenCalledWith(failure);
  });
});
