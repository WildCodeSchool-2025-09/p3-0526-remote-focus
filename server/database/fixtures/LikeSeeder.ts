// server/database/fixtures/LikeSeeder.ts
import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class LikeSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "like_", truncate: true, dependencies: [UserSeeder] });
  }

  async run() {
    // 1. IDs des genres déjà en base (peuplés par npm run tmdb:seed)
    const [rows] = await database.query<Rows>("select ID from genre");
    const genreIds = (rows as { ID: number }[]).map((row) => row.ID);

    if (genreIds.length === 0) {
      throw new Error(
        "Table genre vide : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    // 2. Chaque user aime un sous-ensemble de genres (onboarding US)
    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const sampleSize = this.faker.number.int({ min: 3, max: 8 });
      const pickedGenreIds = this.faker.helpers.arrayElements(
        genreIds,
        Math.min(sampleSize, genreIds.length),
      );

      for (const genreId of pickedGenreIds) {
        // Variable intermédiaire obligatoire : évite le excess property check
        const fakeLike = {
          ID_user: userId,
          ID_genre: genreId,
        };

        this.insert(fakeLike);
      }
    }
  }
}

export default LikeSeeder;
