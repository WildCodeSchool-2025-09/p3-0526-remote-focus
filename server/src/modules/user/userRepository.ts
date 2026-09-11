import databaseClient, { type Rows } from "../../../database/client";

import type { LikedGenre } from "../../types/Genre/Genre.types";

class UserRepository {
  async readPasswordHash(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT password FROM user_ WHERE ID = ?",
      [userId],
    );
    return (rows[0]?.password as string | undefined) ?? null;
  }

  async updateLogin(userId: number, login: string) {
    await databaseClient.query("UPDATE user_ SET login = ? WHERE ID = ?", [
      login,
      userId,
    ]);
  }

  async updateEmail(userId: number, email: string) {
    await databaseClient.query("UPDATE user_ SET email = ? WHERE ID = ?", [
      email,
      userId,
    ]);
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await databaseClient.query("UPDATE user_ SET password = ? WHERE ID = ?", [
      hashedPassword,
      userId,
    ]);
  }

  async updateAvatar(userId: number, avatarPath: string) {
    await databaseClient.query("UPDATE user_ SET avatar = ? WHERE ID = ?", [
      avatarPath,
      userId,
    ]);
  }

  async readRandomGenres(
    userId: number | undefined,
    count = 3,
  ): Promise<LikedGenre[]> {
    let rows: LikedGenre[] = [];

    if (userId != null) {
      [rows] = await databaseClient.query<LikedGenre[]>(
        "SELECT like_.ID_genre AS id, genre.name FROM like_ JOIN genre ON genre.ID = like_.ID_genre WHERE like_.ID_user = ? ORDER BY RAND() LIMIT ?",
        [userId, count],
      );
    }

    if (rows.length < count) {
      const excludedIds = rows.map((row) => row.id);

      const [userGenres] =
        excludedIds.length > 0
          ? await databaseClient.query<LikedGenre[]>(
              "SELECT ID AS id, name FROM genre WHERE ID NOT IN (?) ORDER BY RAND() LIMIT ?",
              [excludedIds, count - rows.length],
            )
          : await databaseClient.query<LikedGenre[]>(
              "SELECT ID AS id, name FROM genre ORDER BY RAND() LIMIT ?",
              [count - rows.length],
            );
      rows = [...rows, ...userGenres];
    }
    return rows;
  }

  async addGenrePreferences(userId: number, genreIds: number[]) {
    if (genreIds.length === 0) {
      return;
    }

    const values = genreIds.map((genreId) => [userId, genreId]);

    await databaseClient.query(
      "INSERT IGNORE INTO like_ (ID_user, ID_genre) VALUES ?",
      [values],
    );
  }

  async readPreferences(userId: number) {
    const [rows] = await databaseClient.query<LikedGenre[]>(
      `SELECT genre.ID AS id, genre.name
       FROM like_
       JOIN genre ON genre.ID = like_.ID_genre
       WHERE like_.ID_user = ?`,
      [userId],
    );
    return rows;
  }
}

export default new UserRepository();
