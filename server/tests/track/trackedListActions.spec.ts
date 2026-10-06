import type { Request, Response } from "express";
import trackActions from "../../src/modules/track/trackActions";
import trackRepository from "../../src/modules/track/trackRepository";

jest.mock("../../src/modules/track/trackRepository");

const mockedTrackRepository = trackRepository as jest.Mocked<
  typeof trackRepository
>;

const createResponse = () => {
  const res = {
    sendStatus: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res as unknown as Response;
};

describe.each([["browseFavorites", "favorite"]] as const)(
  "trackActions.%s",
  (handlerName, list) => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
      const req = { query: {} } as unknown as Request;
      const res = createResponse();

      await trackActions[handlerName](req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockedTrackRepository.browseTracked).not.toHaveBeenCalled();
    });

    test("renvoie 400 si le type est invalide", async () => {
      const req = {
        user: { id: 1 },
        query: { type: "documentary" },
      } as unknown as Request;
      const res = createResponse();

      await trackActions[handlerName](req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockedTrackRepository.browseTracked).not.toHaveBeenCalled();
    });

    test("renvoie 400 si le filtre seen est invalide", async () => {
      const req = {
        user: { id: 1 },
        query: { seen: "yes" },
      } as unknown as Request;
      const res = createResponse();

      await trackActions[handlerName](req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockedTrackRepository.browseTracked).not.toHaveBeenCalled();
    });

    test.each([["0"], ["-1"], ["abc"]])(
      "renvoie 400 si la page vaut %s",
      async (page) => {
        const req = {
          user: { id: 1 },
          query: { page },
        } as unknown as Request;
        const res = createResponse();

        await trackActions[handlerName](req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockedTrackRepository.browseTracked).not.toHaveBeenCalled();
      },
    );

    test("interroge la bonne liste sans filtre par défaut", async () => {
      const req = { user: { id: 1 }, query: {} } as unknown as Request;
      const res = createResponse();

      mockedTrackRepository.browseTracked.mockResolvedValue([]);
      mockedTrackRepository.countTrackedByFilters.mockResolvedValue(0);

      await trackActions[handlerName](req, res, jest.fn());

      expect(mockedTrackRepository.browseTracked).toHaveBeenCalledWith(
        1,
        list,
        null,
        null,
        10,
        0,
      );
    });

    test("transmet le type, le statut et la page au repository", async () => {
      const req = {
        user: { id: 1 },
        query: { type: "tv", seen: "false", page: "3" },
      } as unknown as Request;
      const res = createResponse();

      mockedTrackRepository.browseTracked.mockResolvedValue([]);
      mockedTrackRepository.countTrackedByFilters.mockResolvedValue(0);

      await trackActions[handlerName](req, res, jest.fn());

      expect(mockedTrackRepository.browseTracked).toHaveBeenCalledWith(
        1,
        list,
        "tv",
        false,
        10,
        20,
      );
      expect(mockedTrackRepository.countTrackedByFilters).toHaveBeenCalledWith(
        1,
        list,
        "tv",
        false,
      );
    });

    test("renvoie hasMore à true quand il reste des résultats", async () => {
      const req = { user: { id: 1 }, query: {} } as unknown as Request;
      const res = createResponse();

      mockedTrackRepository.browseTracked.mockResolvedValue([
        {
          ID: 1,
          tmdb_id: 42,
          name: "Film",
          type: "movie",
          released_at: "2020-01-01",
          duration: 120,
          poster: "/poster.jpg",
          synopsis: "Synopsis",
          overall_rating: 7.5,
          status: "released",
          original_name: "Film",
          original_language: "fr",
          pegi: "12",
          is_anime: false,
          genre_name: "Action",
        },
      ] as never);
      mockedTrackRepository.countTrackedByFilters.mockResolvedValue(15);

      await trackActions[handlerName](req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          medias: [expect.objectContaining({ id: 1, genreName: "Action" })],
          hasMore: true,
        }),
      );
    });

    test("renvoie hasMore à false quand il n'y a plus de résultats", async () => {
      const req = { user: { id: 1 }, query: {} } as unknown as Request;
      const res = createResponse();

      mockedTrackRepository.browseTracked.mockResolvedValue([]);
      mockedTrackRepository.countTrackedByFilters.mockResolvedValue(0);

      await trackActions[handlerName](req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith({ medias: [], hasMore: false });
    });
  },
);
