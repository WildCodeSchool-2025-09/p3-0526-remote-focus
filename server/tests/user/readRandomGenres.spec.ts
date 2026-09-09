// server/tests/user/readRandomGenres.spec.ts

import "dotenv/config";

import databaseClient from "../../database/client";
import UserRepository from "../../src/modules/User/UserRepository";

import type { Rows } from "../../database/client";

afterAll((done) => {
  databaseClient.end().then(done);
});

describe("UserRepository.readRandomGenres", () => {
  test("retourne des genres qui font partie des likes réels de l'utilisateur", async () => {
    // Étape 1 : retrouver un utilisateur stable par son login (pas par ID en dur)
    const [userRows] = await databaseClient.query<Rows>(
      "SELECT ID FROM user_ WHERE login = ?",
      ["sophie"],
    );
    const userId = userRows[0].ID;

    // Étape 2 : la vérité terrain, directement en base
    const [likeRows] = await databaseClient.query<Rows>(
      "SELECT ID_genre FROM like_ WHERE ID_user = ?",
      [userId],
    );
    const likedGenreIds = likeRows.map((row) => row.ID_genre);

    // Garde-fou : si le seed n'a donné aucun like à cet utilisateur,
    // le test ne prouverait rien du tout
    expect(likedGenreIds.length).toBeGreaterThanOrEqual(3);

    // Étape 3 : la méthode qu'on teste réellement
    const result = await UserRepository.readRandomGenres(userId, 3);
    const returnedGenreIds = result.map((row) => row.ID_genre);

    // Étape 4 : on doit avoir 3 genres, et chacun doit venir des VRAIS likes
    expect(returnedGenreIds).toHaveLength(3);
    for (const genreId of returnedGenreIds) {
      expect(likedGenreIds).toContain(genreId);
    }
  });

  test("bascule sur des genres aléatoires pour un utilisateur sans préférences", async () => {
    const fakeUserId = 999999; // ID qui n'existe sûrement pas en base

    const result = await UserRepository.readRandomGenres(fakeUserId, 3);

    // On ne peut pas prédire LESQUELS, mais on doit quand même en avoir 3
    expect(result).toHaveLength(3);
  });
});
