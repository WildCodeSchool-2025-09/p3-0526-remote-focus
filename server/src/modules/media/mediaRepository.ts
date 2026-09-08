import databaseClient, { type Rows } from "../../../database/client";

class MediaRepository {
    async read(id: number) {
        const [rows] = await databaseClient.query<Rows>(
            `SELECT ID, name, original_name, poster, synopsis, duration,
              released_at, overall_rating, original_language, pegi
       FROM media
       WHERE ID = ? AND type = ?`,
            [id, "movie"],
        );
        return rows[0] ?? null;
    }

    async readGenres(id: number) {
        const [rows] = await databaseClient.query<Rows>(
            `SELECT g.ID, g.name
       FROM genre AS g
       JOIN classify_as AS c ON c.ID_genre = g.ID
       WHERE c.ID_media = ?`,
            [id],
        );
        return rows;
    }

    async readPlatforms(id: number) {
        const [rows] = await databaseClient.query<Rows>(
            `SELECT p.ID, p.name, p.logo, p.url
       FROM platform AS p
       JOIN available_on AS a ON a.ID_platform = p.ID
       WHERE a.ID_media = ?`,
            [id],
        );
        return rows;
    }

    async readCast(id: number) {
        const [rows] = await databaseClient.query<Rows>(
            `SELECT pe.ID, pe.name, pe.photo, mp.personnage_name, mp.role
       FROM person AS pe
       JOIN media_person AS mp ON mp.ID_person = pe.ID
       WHERE mp.ID_media = ?`,
            [id],
        );
        return rows;
    }
}

export default new MediaRepository();