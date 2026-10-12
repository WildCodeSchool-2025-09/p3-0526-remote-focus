import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class TrackSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "track", truncate: true, dependencies: [UserSeeder] });
  }

  async run() {
    const [rows] = await database.query<Rows>("select ID from media");
    const mediaIds = (rows as { ID: number }[]).map((row) => row.ID);

    if (mediaIds.length === 0) {
      throw new Error(
        "Table media vide : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const sampleSize = this.faker.number.int({ min: 5, max: 15 });
      const pickedMediaIds = this.faker.helpers.arrayElements(
        mediaIds,
        Math.min(sampleSize, mediaIds.length),
      );

      for (const mediaId of pickedMediaIds) {
        const hasRated = this.faker.datatype.boolean({ probability: 0.6 });
        const isFavorite = this.faker.datatype.boolean({ probability: 0.3 });
        const isInWatchlist = this.faker.datatype.boolean({ probability: 0.4 });

        const fakeTrack = {
          ID_user: userId,
          ID_media: mediaId,
          favorite_media: isFavorite,
          user_rating: hasRated
            ? this.faker.number.float({ min: 0, max: 5.0, fractionDigits: 1 })
            : null,
          watchlist: isInWatchlist,
          favorited_at: isFavorite
            ? this.faker.date.recent({ days: 180 })
            : null,
          watchlisted_at: isInWatchlist
            ? this.faker.date.recent({ days: 180 })
            : null,
        };

        this.insert(fakeTrack);
      }
    }
  }
}

export default TrackSeeder;
