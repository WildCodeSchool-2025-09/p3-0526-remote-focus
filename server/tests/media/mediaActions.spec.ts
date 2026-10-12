import type { Request, Response } from "express";
import mediaActions from "../../src/modules/media/mediaActions";
import mediaRepository from "../../src/modules/media/mediaRepository";

jest.mock("../../src/modules/media/mediaRepository");

const mockedRepository = mediaRepository as jest.Mocked<typeof mediaRepository>;

describe("mediaActions.read", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 400 si l'id n'est pas un nombre", async () => {
    const req = { params: { id: "abc" } } as unknown as Request;
    const res = {
      sendStatus: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    await mediaActions.read(req, res, jest.fn());

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

    await mediaActions.read(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(res.json).not.toHaveBeenCalled();
  });
});
