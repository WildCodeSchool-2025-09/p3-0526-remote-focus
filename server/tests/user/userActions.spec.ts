import type { Request, Response } from "express";
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";
import trackRepository from "../../src/modules/track/trackRepository";
import userActions from "../../src/modules/user/userActions";
import userRepository from "../../src/modules/user/userRepository";

jest.mock("../../src/modules/user/userRepository");
jest.mock("../../src/modules/track/trackRepository");
jest.mock("../../src/modules/favorite/favoriteRepository");

const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;
const mockedTrackRepository = trackRepository as jest.Mocked<
  typeof trackRepository
>;
const mockedFavoriteRepository = favoriteRepository as jest.Mocked<
  typeof favoriteRepository
>;

const createResponse = () =>
  ({
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

describe("userActions.readDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {} as unknown as Request;
    const res = createResponse();

    await userActions.readDashboard(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(mockedUserRepository.readProfile).not.toHaveBeenCalled();
  });

  test("renvoie 404 si l'utilisateur authentifié n'existe plus", async () => {
    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readProfile.mockResolvedValue(null);

    await userActions.readDashboard(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });

  test("renvoie le profil et les compteurs remplis", async () => {
    const req = { user: { id: 1 } } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readProfile.mockResolvedValue({
      firstname: "Camille",
      avatar: "/avatar.jpg",
      created_at: "2025-03-01T00:00:00.000Z",
    } as never);
    mockedTrackRepository.countFavoriteMedias.mockResolvedValue(24);
    mockedTrackRepository.countWatchlist.mockResolvedValue(8);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(12);

    await userActions.readDashboard(req, res, jest.fn());

    expect(mockedTrackRepository.countFavoriteMedias).toHaveBeenCalledWith(1);
    expect(mockedTrackRepository.countWatchlist).toHaveBeenCalledWith(1);
    expect(mockedFavoriteRepository.countFavoriteActors).toHaveBeenCalledWith(
      1,
    );
    expect(res.json).toHaveBeenCalledWith({
      profile: {
        name: "Camille",
        avatar: "/avatar.jpg",
        createdAt: "2025-03-01T00:00:00.000Z",
      },
      counts: { favorites: 24, watchlist: 8, actors: 12 },
    });
  });

  test("renvoie des compteurs à 0 quand l'utilisateur n'a rien suivi", async () => {
    const req = { user: { id: 2 } } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readProfile.mockResolvedValue({
      firstname: "Tester",
      avatar: "/avatar.jpg",
      created_at: "2025-01-01T00:00:00.000Z",
    } as never);
    mockedTrackRepository.countFavoriteMedias.mockResolvedValue(0);
    mockedTrackRepository.countWatchlist.mockResolvedValue(0);
    mockedFavoriteRepository.countFavoriteActors.mockResolvedValue(0);

    await userActions.readDashboard(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      profile: {
        name: "Tester",
        avatar: "/avatar.jpg",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
      counts: { favorites: 0, watchlist: 0, actors: 0 },
    });
  });
});
