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

  async readFavoriteActors(userId: number, limit: number, offset: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT pe.ID, pe.name, pe.photo,
              COALESCE(seen.viewed_count, 0) AS viewed_count
       FROM favorite AS f
       JOIN person AS pe ON pe.ID = f.ID_person
       LEFT JOIN (
         SELECT seen_media.ID_person,
                COUNT(DISTINCT seen_media.ID_media) AS viewed_count
         FROM (
           SELECT mp.ID_person, mp.ID_media
           FROM media_person AS mp
           JOIN media_user AS mu ON mu.ID_media = mp.ID_media
           JOIN favorite AS fm ON fm.ID_person = mp.ID_person
           WHERE mu.ID_user = ? AND fm.ID_user = ? AND mp.role = 'actor'

           UNION

           SELECT ep.ID_person, s.ID_media
           FROM episode_person AS ep
           JOIN episode_user AS eu ON eu.ID_episode = ep.ID_episode
           JOIN episode AS e ON e.ID = ep.ID_episode
           JOIN season AS s ON s.ID = e.ID_season
           JOIN favorite AS fe ON fe.ID_person = ep.ID_person
           WHERE eu.ID_user = ? AND fe.ID_user = ? AND ep.role = 'actor'
         ) AS seen_media
         GROUP BY seen_media.ID_person
       ) AS seen ON seen.ID_person = pe.ID
       WHERE f.ID_user = ?
       ORDER BY viewed_count DESC, pe.name ASC, pe.ID ASC
       LIMIT ? OFFSET ?`,
      [userId, userId, userId, userId, userId, limit, offset],
    );

    return rows;
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
