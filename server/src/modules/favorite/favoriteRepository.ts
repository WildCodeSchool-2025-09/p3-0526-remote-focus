import databaseClient, { type Rows } from "../../../database/client";

class FavoriteRepository {
  async countFavoriteActors(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM favorite WHERE ID_user = ?",
      [userId],
    );
    return Number(rows[0].total);
  }
}

export default new FavoriteRepository();
