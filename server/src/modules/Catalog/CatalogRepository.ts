import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

class CatalogRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>("SELECT * FROM media");
    return rows;
  }

  async readTopRated(type: string | null) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM media WHERE type = ? OR ? IS NULL ORDER BY overall_rating DESC LIMIT 10",
      [type, type],
    );
    return rows;
  }
}

export default new CatalogRepository();
