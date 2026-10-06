import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

class FavoriteRepository {
  async countFavoriteActors(userId: number): Promise<number> {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT COUNT(*) AS total FROM favorite WHERE ID_user = ?",
      [userId],
    );

    return Number(rows[0].total);
  }

  async readAll(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID_person AS actorId FROM favorite WHERE ID_user = ?",
      [userId],
    );

    return rows.map((row) => ({
      actorId: Number(row.actorId),
      isFavorite: true,
    }));
  }

  async toggleFavorite(userId: number, actorId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID_person
       FROM favorite
       WHERE ID_user = ? AND ID_person = ?`,
      [userId, actorId],
    );

    const isCurrentlyFavorite = rows.length > 0;

    if (isCurrentlyFavorite) {
      await databaseClient.query<Result>(
        "DELETE FROM favorite WHERE ID_user = ? AND ID_person = ?",
        [userId, actorId],
      );
    } else {
      await databaseClient.query<Result>(
        "INSERT INTO favorite (ID_user, ID_person) VALUES (?, ?)",
        [userId, actorId],
      );
    }

    return {
      actorId,
      isFavorite: !isCurrentlyFavorite,
    };
  }
}

export default new FavoriteRepository();
