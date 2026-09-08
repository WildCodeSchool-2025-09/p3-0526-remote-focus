import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

class UserRepository {
  async readRandomGenres(userId: number | undefined, count = 3) {
    let rows: Rows = [];

    if (userId != null) {
      [rows] = await databaseClient.query<Rows>(
        "SELECT ID_genre FROM like_ WHERE ID_user = ? ORDER BY RAND() LIMIT ?",
        [userId, count],
      );
    }

    if (rows.length < count) {
      const excludedIds = rows.map((row) => row.ID_genre);

      const [userGenres] =
        excludedIds.length > 0
          ? await databaseClient.query<Rows>(
              "SELECT id AS ID_genre FROM genre WHERE id NOT IN (?) ORDER BY RAND() LIMIT ?",
              [excludedIds, count - rows.length],
            )
          : await databaseClient.query<Rows>(
              "SELECT id AS ID_genre FROM genre ORDER BY RAND() LIMIT ?",
              [count - rows.length],
            );
      rows = [...rows, ...userGenres];
    }
    return rows;
  }
}

export default new UserRepository();
