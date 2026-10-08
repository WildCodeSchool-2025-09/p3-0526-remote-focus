import argon2 from "argon2";
import type { Request, Response } from "express";
import userActions from "../../src/modules/user/userActions";
import userRepository from "../../src/modules/user/userRepository";

jest.mock("../../src/modules/user/userRepository");

const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
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

describe("userActions.updateLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = { body: { login: "newlogin" } } as unknown as Request;
    const res = createResponse();

    await userActions.updateLogin(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(mockedUserRepository.updateLogin).not.toHaveBeenCalled();
  });

  test("renvoie 400 si le pseudo est invalide", async () => {
    const req = {
      user: { id: 1 },
      body: { login: "" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updateLogin(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUserRepository.updateLogin).not.toHaveBeenCalled();
  });

  test("renvoie 409 si le pseudo est déjà utilisé par un autre compte", async () => {
    const req = {
      user: { id: 1 },
      body: { login: "taken" },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.findByLogin.mockResolvedValue(true);

    await userActions.updateLogin(req, res, jest.fn());

    expect(mockedUserRepository.findByLogin).toHaveBeenCalledWith("taken", 1);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockedUserRepository.updateLogin).not.toHaveBeenCalled();
  });

  test("met à jour le pseudo et renvoie 200", async () => {
    const req = {
      user: { id: 1 },
      body: { login: "  newlogin  " },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.findByLogin.mockResolvedValue(false);

    await userActions.updateLogin(req, res, jest.fn());

    expect(mockedUserRepository.updateLogin).toHaveBeenCalledWith(
      1,
      "newlogin",
    );
    expect(res.json).toHaveBeenCalledWith({ login: "newlogin" });
  });
});

describe("userActions.updateEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      body: { email: "new@example.com" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updateEmail(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(mockedUserRepository.updateEmail).not.toHaveBeenCalled();
  });

  test("renvoie 400 si l'email est invalide", async () => {
    const req = {
      user: { id: 1 },
      body: { email: "not-an-email" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updateEmail(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUserRepository.updateEmail).not.toHaveBeenCalled();
  });

  test("renvoie 409 si l'email est déjà utilisé par un autre compte", async () => {
    const req = {
      user: { id: 1 },
      body: { email: "taken@example.com" },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.findByEmail.mockResolvedValue(true);

    await userActions.updateEmail(req, res, jest.fn());

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      "taken@example.com",
      1,
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(mockedUserRepository.updateEmail).not.toHaveBeenCalled();
  });

  test("met à jour l'email et renvoie 200", async () => {
    const req = {
      user: { id: 1 },
      body: { email: "  New@Example.com  " },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.findByEmail.mockResolvedValue(false);

    await userActions.updateEmail(req, res, jest.fn());

    expect(mockedUserRepository.updateEmail).toHaveBeenCalledWith(
      1,
      "new@example.com",
    );
    expect(res.json).toHaveBeenCalledWith({ email: "new@example.com" });
  });
});

describe("userActions.updatePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renvoie 401 si l'utilisateur n'est pas authentifié", async () => {
    const req = {
      body: { currentPassword: "oldpassword", newPassword: "newpassword123" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updatePassword(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(mockedUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  test("renvoie 400 si le mot de passe actuel est manquant", async () => {
    const req = {
      user: { id: 1 },
      body: { currentPassword: "", newPassword: "newpassword123" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updatePassword(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUserRepository.readHashedPasswordById).not.toHaveBeenCalled();
  });

  test("renvoie 400 si le nouveau mot de passe est invalide", async () => {
    const req = {
      user: { id: 1 },
      body: { currentPassword: "oldpassword", newPassword: "short" },
    } as unknown as Request;
    const res = createResponse();

    await userActions.updatePassword(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUserRepository.readHashedPasswordById).not.toHaveBeenCalled();
  });

  test("renvoie 404 si l'utilisateur authentifié n'existe plus", async () => {
    const req = {
      user: { id: 1 },
      body: { currentPassword: "oldpassword", newPassword: "newpassword123" },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readHashedPasswordById.mockResolvedValue(null);

    await userActions.updatePassword(req, res, jest.fn());

    expect(res.sendStatus).toHaveBeenCalledWith(404);
    expect(mockedUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  test("renvoie 400 si le mot de passe actuel est incorrect", async () => {
    const req = {
      user: { id: 1 },
      body: { currentPassword: "wrongpassword", newPassword: "newpassword123" },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readHashedPasswordById.mockResolvedValue(
      await argon2.hash("oldpassword"),
    );

    await userActions.updatePassword(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedUserRepository.updatePassword).not.toHaveBeenCalled();
  });

  test("met à jour le mot de passe et renvoie 204", async () => {
    const req = {
      user: { id: 1 },
      body: { currentPassword: "oldpassword", newPassword: "newpassword123" },
    } as unknown as Request;
    const res = createResponse();

    mockedUserRepository.readHashedPasswordById.mockResolvedValue(
      await argon2.hash("oldpassword"),
    );

    await userActions.updatePassword(req, res, jest.fn());

    expect(mockedUserRepository.updatePassword).toHaveBeenCalledWith(
      1,
      expect.any(String),
    );
    const newHashedPassword =
      mockedUserRepository.updatePassword.mock.calls[0][1];
    await expect(
      argon2.verify(newHashedPassword, "newpassword123"),
    ).resolves.toBe(true);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });
});
