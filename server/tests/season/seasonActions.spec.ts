import type { Request, Response } from "express";
import seasonActions from "../../src/modules/season/seasonActions";
import seasonRepository from "../../src/modules/season/seasonRepository";

jest.mock("../../src/modules/season/seasonRepository");
jest.mock("../../src/modules/media/mediaRepository");

const mockedRepository = seasonRepository as jest.Mocked<
  typeof seasonRepository
>;

const createResponse = () =>
  ({
    sendStatus: jest.fn(),
    json: jest.fn(),
  }) as unknown as Response;

describe("seasonActions.read", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 400 si l'id n'est pas un nombre", async () => {
    const req = {
      params: { id: "11", seasonId: "abc" },
    } as unknown as Request;
    const res = createResponse();

    await seasonActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(mockedRepository.read).not.toHaveBeenCalled();
  });

  test("renvoie 404 si la saison n'existe pas", async () => {
    mockedRepository.read.mockResolvedValue(null);

    const req = {
      params: { id: "11", seasonId: "99999" },
    } as unknown as Request;
    const res = createResponse();

    await seasonActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });

  test("renvoie 404 si la saison n'appartient pas à la série", async () => {
    mockedRepository.read.mockResolvedValue({ ID: 1, ID_media: 12 } as never);

    const req = {
      params: { id: "11", seasonId: "1" },
    } as unknown as Request;
    const res = createResponse();

    await seasonActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("seasonActions.readEpisodes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 400 si l'id n'est pas un nombre", async () => {
    const req = {
      params: { id: "11", seasonId: "abc" },
    } as unknown as Request;
    const res = createResponse();

    await seasonActions.readEpisodes(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(mockedRepository.readEpisodes).not.toHaveBeenCalled();
  });
});
