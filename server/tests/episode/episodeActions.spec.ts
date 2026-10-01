import type { Request, Response } from "express";
import episodeActions from "../../src/modules/episode/episodeActions";
import episodeRepository from "../../src/modules/episode/episodeRepository";
import mediaRepository from "../../src/modules/media/mediaRepository";

jest.mock("../../src/modules/episode/episodeRepository");
jest.mock("../../src/modules/media/mediaRepository");

const mockedRepository = episodeRepository as jest.Mocked<
  typeof episodeRepository
>;
const mockedMediaRepository = mediaRepository as jest.Mocked<
  typeof mediaRepository
>;

const createResponse = () =>
  ({
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

const baseRequest = {
  params: { id: "11", seasonId: "2", episodeId: "3" },
} as unknown as Request;

describe("episodeActions.read", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 400 si un des ids n'est pas un nombre", async () => {
    const req = {
      params: { id: "11", seasonId: "2", episodeId: "abc" },
    } as unknown as Request;
    const res = createResponse();

    await episodeActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(mockedRepository.read).not.toHaveBeenCalled();
  });

  test("renvoie 404 si l'épisode n'existe pas", async () => {
    mockedRepository.read.mockResolvedValue(null);
    const res = createResponse();

    await episodeActions.read(baseRequest, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });

  test("renvoie 404 si l'épisode n'appartient pas à la saison de l'URL", async () => {
    mockedRepository.read.mockResolvedValue({
      ID: 3,
      ID_season: 99,
      ID_media: 11,
    } as never);
    const res = createResponse();

    await episodeActions.read(baseRequest, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });

  test("renvoie 404 si la saison n'appartient pas à la série de l'URL", async () => {
    mockedRepository.read.mockResolvedValue({
      ID: 3,
      ID_season: 2,
      ID_media: 99,
    } as never);
    const res = createResponse();

    await episodeActions.read(baseRequest, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });

  test("renvoie la fiche complète de l'épisode", async () => {
    mockedRepository.read.mockResolvedValue({
      ID: 3,
      name: "Le retour",
      number: 3,
      released_at: "2024-12-23",
      synopsis: "Le frère revient sur la version des faits.",
      duration: 48,
      ID_season: 2,
      season_number: 2,
      season_poster: null,
      ID_media: 11,
      media_name: "Titre de la série",
      media_poster: "/serie.jpg",
      original_language: "en",
      overall_rating: 7.8,
      type: "tv",
      is_anime: 0,
    } as never);
    mockedRepository.readCast.mockResolvedValue([
      { ID: 1, name: "Comédien 1", photo: null, personnage_name: "Le Frère" },
    ] as never);
    mockedRepository.countCast.mockResolvedValue(1);
    mockedMediaRepository.readPlatforms.mockResolvedValue([
      { ID: 1, name: "Netflix", logo: "/netflix.png", url: null },
    ] as never);

    const res = createResponse();

    await episodeActions.read(baseRequest, res, jest.fn());

    expect(mockedMediaRepository.readPlatforms).toHaveBeenCalledWith(11);
    expect(res.json).toHaveBeenCalledWith({
      id: 3,
      name: "Le retour",
      number: 3,
      releasedAt: "2024-12-23",
      synopsis: "Le frère revient sur la version des faits.",
      duration: 48,
      poster: "/serie.jpg",
      originalLanguage: "en",
      overallRating: 7.8,
      season: { id: 2, number: 2 },
      serie: {
        id: 11,
        name: "Titre de la série",
        poster: "/serie.jpg",
        isAnime: false,
      },
      platforms: [{ id: 1, name: "Netflix", logo: "/netflix.png", url: null }],
      cast: [
        {
          id: 1,
          name: "Comédien 1",
          photo: null,
          characterName: "Le Frère",
          role: undefined,
        },
      ],
      castTotal: 1,
      userStatus: null,
    });
  });
});
