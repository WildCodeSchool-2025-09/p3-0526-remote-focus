import type { RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";

import type { Result } from "../../../database/client";
import type { LikedGenre } from "../../types/Genre/Genre.types";
import type { RegisterUserInput } from "../../types/User/User.types";

class UserRepository {
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

  async create(user: RegisterUserInput): Promise<number> {
    const [result] = await databaseClient.query<Result>(
      `
        INSERT INTO user_ (
          firstname,
          lastname,
          email,
          born_at,
          login,
          hashed_password
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        user.firstName,
        user.lastName,
        user.email,
        user.bornAt,
        user.login,
        user.hashedPassword,
      ],
    );

    return result.insertId;
  }
  async emailExists(email: string): Promise<boolean> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      "SELECT ID FROM user_ WHERE email = ? LIMIT 1",
      [email],
    );

    return rows.length > 0;
  }

  async loginExists(login: string): Promise<boolean> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      "SELECT ID FROM user_ WHERE login = ? LIMIT 1",
      [login],
    );

    return rows.length > 0;
  }
}

export default new UserRepository();
