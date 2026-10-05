import type { Request, Response } from "express";
import trackActions from "../../src/modules/track/trackActions";
import trackRepository from "../../src/modules/track/trackRepository";

jest.mock("../../src/modules/track/trackRepository");

const mockedTrackRepository = trackRepository as jest.Mocked<
  typeof trackRepository
>;

const createResponse = () =>
  ({
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

describe("trackActions.browseWatchlist", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = { query: {} } as unknown as Request;
    const res = createResponse();

    await trackActions.browseWatchlist(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(mockedTrackRepository.browseWatchlist).not.toHaveBeenCalled();
  });

  test("ignore un type invalide et interroge sans filtre", async () => {
    const req = {
      user: { id: 1 },
      query: { type: "documentary" },
    } as unknown as Request;
    const res = createResponse();

    mockedTrackRepository.browseWatchlist.mockResolvedValue([]);
    mockedTrackRepository.countWatchlistByFilters.mockResolvedValue(0);

    await trackActions.browseWatchlist(req, res, jest.fn());

    expect(mockedTrackRepository.browseWatchlist).toHaveBeenCalledWith(
      1,
      null,
      null,
      10,
      0,
    );
  });

  test("transmet le type et le statut vu/à voir au repository", async () => {
    const req = {
      user: { id: 1 },
      query: { type: "movie", seen: "true", page: "2" },
    } as unknown as Request;
    const res = createResponse();

    mockedTrackRepository.browseWatchlist.mockResolvedValue([]);
    mockedTrackRepository.countWatchlistByFilters.mockResolvedValue(0);

    await trackActions.browseWatchlist(req, res, jest.fn());

    expect(mockedTrackRepository.browseWatchlist).toHaveBeenCalledWith(
      1,
      "movie",
      true,
      10,
      10,
    );
    expect(mockedTrackRepository.countWatchlistByFilters).toHaveBeenCalledWith(
      1,
      "movie",
      true,
    );
  });

  test("renvoie hasMore à true quand il reste des résultats", async () => {
    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();

    mockedTrackRepository.browseWatchlist.mockResolvedValue([
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
    mockedTrackRepository.countWatchlistByFilters.mockResolvedValue(15);

    await trackActions.browseWatchlist(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      medias: [
        {
          id: 1,
          tmdbId: 42,
          name: "Film",
          type: "movie",
          releasedAt: "2020-01-01",
          duration: 120,
          poster: "/poster.jpg",
          synopsis: "Synopsis",
          overallRating: 7.5,
          status: "released",
          originalName: "Film",
          originalLanguage: "fr",
          pegi: "12",
          isAnime: false,
          genreName: "Action",
        },
      ],
      hasMore: true,
    });
  });

  test("renvoie hasMore à false quand il n'y a plus de résultats", async () => {
    const req = { user: { id: 1 }, query: {} } as unknown as Request;
    const res = createResponse();

    mockedTrackRepository.browseWatchlist.mockResolvedValue([]);
    mockedTrackRepository.countWatchlistByFilters.mockResolvedValue(0);

    await trackActions.browseWatchlist(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ medias: [], hasMore: false });
  });
});
