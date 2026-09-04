// server/database/fixtures/MediaUserSeeder.ts
import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class MediaUserSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "media_user",
      truncate: true,
      dependencies: [UserSeeder],
    });
  }

  async run() {
    // 1. Seuls les FILMS passent par media_user : les séries/animes sont
    //    suivis épisode par épisode via episode_user (voir EpisodeSeeder).
    const [rows] = await database.query<Rows>(
      "select ID from media where type = 'movie'",
    );
    const movieIds = (rows as { ID: number }[]).map((row) => row.ID);

    if (movieIds.length === 0) {
      throw new Error(
        "Aucun film en base : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    // 2. Chaque user a "vu" un sous-ensemble de films
    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const sampleSize = this.faker.number.int({ min: 2, max: 7 });
      const pickedMovieIds = this.faker.helpers.arrayElements(
        movieIds,
        Math.min(sampleSize, movieIds.length),
      );

      for (const movieId of pickedMovieIds) {
        // Variable intermédiaire obligatoire : évite le excess property check
        const fakeMediaUser = {
          ID_user: userId,
          ID_media: movieId,
          // Un visionnage passé, dans les 6 derniers mois
          viewed_at: this.faker.date.recent({ days: 180 }),
        };

        this.insert(fakeMediaUser);
      }
    }
  }
}

export default MediaUserSeeder;
