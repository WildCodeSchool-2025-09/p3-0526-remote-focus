import type { RowDataPacket } from "mysql2";
import databaseClient from "../../../database/client";
import type { Result } from "../../../database/client";
import type { LikedGenre } from "../../types/Genre/Genre.types";
import type {
  RegisterUserInput,
  UserAuthRow,
} from "../../types/User/User.types";

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

  async readProfile(userId: number) {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      `SELECT firstname, lastname, email, born_at, login, avatar, created_at, dark_theme, is_pegi16
      FROM user_
      WHERE ID = ?`,
      [userId],
    );

    return (rows[0] as RowDataPacket | undefined) ?? null;
  }

  async findByEmail(email: string, excludeUserId?: number): Promise<boolean> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      excludeUserId == null
        ? "SELECT ID FROM user_ WHERE email = ? LIMIT 1"
        : "SELECT ID FROM user_ WHERE email = ? AND ID <> ? LIMIT 1",
      excludeUserId == null ? [email] : [email, excludeUserId],
    );

    return rows.length > 0;
  }

  async readByEmail(email: string): Promise<UserAuthRow | null> {
    const [rows] = await databaseClient.query<UserAuthRow[]>(
      "SELECT ID, firstname, lastname, email, login, avatar, role, hashed_password FROM user_ WHERE email = ? LIMIT 1",
      [email],
    );

    return rows[0] ?? null;
  }

  async findByLogin(login: string, excludeUserId?: number): Promise<boolean> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      excludeUserId == null
        ? "SELECT ID FROM user_ WHERE login = ? LIMIT 1"
        : "SELECT ID FROM user_ WHERE login = ? AND ID <> ? LIMIT 1",
      excludeUserId == null ? [login] : [login, excludeUserId],
    );

    return rows.length > 0;
  }

  async readHashedPasswordById(userId: number): Promise<string | null> {
    const [rows] = await databaseClient.query<RowDataPacket[]>(
      "SELECT hashed_password FROM user_ WHERE ID = ? LIMIT 1",
      [userId],
    );

    const row = rows[0] as { hashed_password: string } | undefined;

    return row?.hashed_password ?? null;
  }

  async addLikedGenres(userId: number, genreIds: number[]): Promise<void> {
    if (genreIds.length === 0) {
      return;
    }

    const placeholders = genreIds.map(() => "(?, ?)").join(", ");

    const values = genreIds.flatMap((genreId) => [userId, genreId]);

    await databaseClient.query<Result>(
      `
        INSERT INTO like_ (
          ID_user,
          ID_genre
        )
        VALUES ${placeholders}
      `,
      values,
    );
  }

  async updateLogin(userId: number, login: string): Promise<void> {
    await databaseClient.query<Result>(
      "UPDATE user_ SET login = ? WHERE ID = ?",
      [login, userId],
    );
  }
}

export default new UserRepository();
