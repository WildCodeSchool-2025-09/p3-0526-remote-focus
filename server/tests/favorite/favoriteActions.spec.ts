import type { Request, Response } from "express";
import actorRepository from "../../src/modules/actor/actorRepository";
import favoriteActions from "../../src/modules/favorite/favoriteActions";
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";

jest.mock("../../src/modules/favorite/favoriteRepository");
jest.mock("../../src/modules/actor/actorRepository");

const mockedFavoriteRepository = favoriteRepository as jest.Mocked<
  typeof favoriteRepository
>;
const mockedActorRepository = actorRepository as jest.Mocked<
  typeof actorRepository
>;

const createResponse = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }) as unknown as Response;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("favoriteActions.browse", () => {
  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await favoriteActions.browse(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedFavoriteRepository.readAll).not.toHaveBeenCalled();
  });

  test("renvoie les acteurs favoris de l'utilisateur", async () => {
    const favorites = [{ actorId: 5, isFavorite: true }];
    mockedFavoriteRepository.readAll.mockResolvedValue(favorites);

    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    await favoriteActions.browse(req, res, jest.fn());

    expect(mockedFavoriteRepository.readAll).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(favorites);
  });
});

describe("favoriteActions.toggleFavorite", () => {
  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = { params: { id: "5" } } as unknown as Request;
    const res = createResponse();

    await favoriteActions.toggleFavorite(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedFavoriteRepository.toggleFavorite).not.toHaveBeenCalled();
  });

  test.each(["abc", "0", "-3", "1.5"])(
    "renvoie 400 pour l'identifiant invalide %s",
    async (id) => {
      const req = { params: { id }, user: { id: 1 } } as unknown as Request;
      const res = createResponse();

      await favoriteActions.toggleFavorite(req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockedActorRepository.read).not.toHaveBeenCalled();
      expect(mockedFavoriteRepository.toggleFavorite).not.toHaveBeenCalled();
    },
  );

  test("renvoie 404 si l'acteur n'existe pas", async () => {
    mockedActorRepository.read.mockResolvedValue(null as never);

    const req = {
      params: { id: "999" },
      user: { id: 1 },
    } as unknown as Request;
    const res = createResponse();

    await favoriteActions.toggleFavorite(req, res, jest.fn());

    expect(mockedActorRepository.read).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(mockedFavoriteRepository.toggleFavorite).not.toHaveBeenCalled();
  });

  test("bascule le favori et renvoie son état", async () => {
    mockedActorRepository.read.mockResolvedValue({ ID: 5 } as never);
    mockedFavoriteRepository.toggleFavorite.mockResolvedValue({
      actorId: 5,
      isFavorite: true,
    });

    const req = { params: { id: "5" }, user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    await favoriteActions.toggleFavorite(req, res, jest.fn());

    expect(mockedFavoriteRepository.toggleFavorite).toHaveBeenCalledWith(1, 5);
    expect(res.json).toHaveBeenCalledWith({ actorId: 5, isFavorite: true });
  });

  test("transmet l'erreur au gestionnaire d'erreurs", async () => {
    const failure = new Error("database down");
    mockedActorRepository.read.mockRejectedValue(failure);

    const req = { params: { id: "5" }, user: { id: 1 } } as unknown as Request;
    const res = createResponse();
    const next = jest.fn();

    await favoriteActions.toggleFavorite(req, res, next);

    expect(next).toHaveBeenCalledWith(failure);
  });
});
