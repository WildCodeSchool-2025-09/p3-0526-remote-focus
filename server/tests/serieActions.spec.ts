import type { Request, Response } from "express";
import mediaRepository from "../src/modules/media/mediaRepository";
import serieActions from "../src/modules/serie/serieActions";

jest.mock("../src/modules/media/mediaRepository");

const mockedRepository = mediaRepository as jest.Mocked<typeof mediaRepository>;

describe("serieActions.read", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 400 si l'id n'est pas un nombre", async () => {
    const req = { params: { id: "abc" } } as unknown as Request;
    const res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    await serieActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(400);
    expect(mockedRepository.read).not.toHaveBeenCalled();
  });

  test("renvoie 404 si le média n'existe pas", async () => {
    mockedRepository.read.mockResolvedValue(null);

    const req = { params: { id: "99999" } } as unknown as Request;
    const res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    await serieActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
  });

  test("renvoie 404 si le média n'est pas une série", async () => {
    mockedRepository.read.mockResolvedValue({ ID: 1, type: "movie" } as never);

    const req = { params: { id: "1" } } as unknown as Request;
    const res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    await serieActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });
});
