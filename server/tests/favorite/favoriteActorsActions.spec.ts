import type { Request, Response } from "express";
import favoriteActions from "../../src/modules/favorite/favoriteActions";
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";

jest.mock("../../src/modules/favorite/favoriteRepository");

const mockedFavoriteRepository = favoriteRepository as jest.Mocked<
  typeof favoriteRepository
>;

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("favoriteActions.browseFavoriteActors", () => {
  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = { query: {} } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browseFavoriteActors(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedFavoriteRepository.readFavoriteActors).not.toHaveBeenCalled();
  });

  test.each(["0", "-1", "abc"])(
    "renvoie 400 si la page vaut %s",
    async (page) => {
      const req = {
        user: { id: 1 },
        query: { page },
      } as unknown as Request;
      const res = createResponse();

      await favoriteActions.browseFavoriteActors(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(
        mockedFavoriteRepository.readFavoriteActors,
      ).not.toHaveBeenCalled();
    },
  );

  test.each(["0", "51", "abc"])(
    "renvoie 400 si la limite vaut %s",
    async (limit) => {
      const req = {
        user: { id: 1 },
        query: { limit },
      } as unknown as Request;
      const res = createResponse();

      await favoriteActions.browseFavoriteActors(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(
        mockedFavoriteRepository.readFavoriteActors,
      ).not.toHaveBeenCalled();
    },
  );

  test("utilise la page 1 et 6 acteurs par défaut", async () => {
    mockedFavoriteRepository.readFavoriteActors.mockResolvedValue([] as never);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(0);

    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browseFavoriteActors(req, res, jest.fn());

    expect(mockedFavoriteRepository.readFavoriteActors).toHaveBeenCalledWith(
      1,
      6,
      0,
    );
    expect(mockedFavoriteRepository.countFavoriteActors).toHaveBeenCalledWith(
      1,
    );
  });

  test("calcule l'offset de la page demandée", async () => {
    mockedFavoriteRepository.readFavoriteActors.mockResolvedValue([] as never);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(0);

    const req = {
      user: { id: 1 },
      query: { page: "3", limit: "6" },
    } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browseFavoriteActors(req, res, jest.fn());

    expect(mockedFavoriteRepository.readFavoriteActors).toHaveBeenCalledWith(
      1,
      6,
      12,
    );
  });

  test("formate les acteurs et indique qu'il en reste d'autres", async () => {
    mockedFavoriteRepository.readFavoriteActors.mockResolvedValue([
      { ID: 7, name: "Jamie Martz", photo: "/jamie.jpg", viewed_count: "2" },
    ] as never);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(8);

    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browseFavoriteActors(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      data: [
        { id: 7, name: "Jamie Martz", photo: "/jamie.jpg", viewedCount: 2 },
      ],
      pagination: { page: 1, limit: 6, total: 8, hasMore: true },
    });
  });

  test("renvoie une liste vide, sans erreur, quand il n'y a aucun favori", async () => {
    mockedFavoriteRepository.readFavoriteActors.mockResolvedValue([] as never);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(0);

    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browseFavoriteActors(req, res, jest.fn());

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      data: [],
      pagination: { page: 1, limit: 6, total: 0, hasMore: false },
    });
  });

  test("transmet l'erreur au gestionnaire d'erreurs", async () => {
    const failure = new Error("database down");
    mockedFavoriteRepository.readFavoriteActors.mockRejectedValue(failure);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(0);

    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    await favoriteActions.browseFavoriteActors(req, res, next);

    expect(next).toHaveBeenCalledWith(failure);
  });
});
