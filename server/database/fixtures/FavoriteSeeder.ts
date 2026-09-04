// server/database/fixtures/FavoriteSeeder.ts
import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class FavoriteSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "favorite", truncate: true, dependencies: [UserSeeder] });
  }

  async run() {
    const [rows] = await database.query<Rows>("select ID from person");
    const personIds = (rows as { ID: number }[]).map((row) => row.ID);

    if (personIds.length === 0) {
      throw new Error(
        "Table person vide : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const sampleSize = this.faker.number.int({ min: 2, max: 6 });
      const pickedPersonIds = this.faker.helpers.arrayElements(
        personIds,
        Math.min(sampleSize, personIds.length),
      );

      for (const personId of pickedPersonIds) {
        // Variable intermédiaire obligatoire : évite le excess property check
        const fakeFavorite = {
          ID_user: userId,
          ID_person: personId,
        };

        this.insert(fakeFavorite);
      }
    }
  }
}

export default FavoriteSeeder;
