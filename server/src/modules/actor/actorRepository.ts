import databaseClient, { type Rows } from "../../../database/client";

type FilmographyOptions = {
  excludeMediaId?: number;
  sortOrder?: "asc" | "desc";
  limit?: number;
};

class ActorRepository {
  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID, name, photo, biography FROM person WHERE ID = ?",
      [id],
    );
    return rows[0] ?? null;
  }

  async readFilmography(personId: number, options: FilmographyOptions = {}) {
    const { excludeMediaId, sortOrder = "desc", limit } = options;

    const params: unknown[] = [personId];
    let excludeClause = "";

    if (excludeMediaId != null) {
      excludeClause = "AND m.ID <> ?";
      params.push(excludeMediaId);
    }

    let limitClause = "";
    if (limit != null) {
      limitClause = "LIMIT ?";
      params.push(limit);
    }

    const [rows] = await databaseClient.query<Rows>(
      `SELECT m.ID, m.name, m.poster, m.type, m.released_at,
              mp.personnage_name
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       WHERE mp.ID_person = ?
         AND mp.role = 'actor'
         ${excludeClause}
       ORDER BY m.released_at ${sortOrder === "asc" ? "ASC" : "DESC"}
       ${limitClause}`,
      params,
    );
    return rows;
  }
}

export default new ActorRepository();
