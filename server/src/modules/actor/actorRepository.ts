import databaseClient, { type Rows } from "../../../database/client";

class ActorRepository {
    async readFilmography(personId: number, excludeMediaId: number) {
        const [rows] = await databaseClient.query<Rows>(
            `SELECT m.ID, m.name, m.poster, m.type, m.released_at,
              mp.personnage_name
       FROM media AS m
       JOIN media_person AS mp ON mp.ID_media = m.ID
       WHERE mp.ID_person = ?
         AND mp.role = 'actor'
         AND m.ID <> ?
       ORDER BY m.released_at DESC
       LIMIT 6`,
            [personId, excludeMediaId],
        );
        return rows;
    }
}

export default new ActorRepository();