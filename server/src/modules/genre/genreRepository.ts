import databaseClient from "../../../database/client";

import type { Genre } from "../../types/Genre/Genre.types";

class GenreRepository {
  async readAll(): Promise<Genre[]> {
    const [rows] = await databaseClient.query<Genre[]>(
      `
        SELECT
          ID AS id,
          name
        FROM genre
        ORDER BY name
      `,
    );

    return rows;
  }
}

export default new GenreRepository();
