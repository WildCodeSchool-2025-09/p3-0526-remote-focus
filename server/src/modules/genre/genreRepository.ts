import databaseClient from "../../../database/client";
import type { Genre } from "../../types/Genre/Genre.types";

class GenreRepository {
  async browse() {
    const [rows] = await databaseClient.query<Genre[]>(
      "SELECT ID AS id, name FROM genre ORDER BY name ASC",
    );
    return rows;
  }

  async findByIds(ids: number[]) {
    if (ids.length === 0) {
      return [];
    }

    const [rows] = await databaseClient.query<Genre[]>(
      "SELECT ID AS id, name FROM genre WHERE ID IN (?)",
      [ids],
    );
    return rows;
  }
}

export default new GenreRepository();
