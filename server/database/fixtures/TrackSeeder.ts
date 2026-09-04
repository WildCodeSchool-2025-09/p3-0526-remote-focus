// server/database/fixtures/TrackSeeder.ts
import database from "../client";

import type { Rows } from "../client";

import AbstractSeeder from "./AbstractSeeder";
import UserSeeder from "./UserSeeder";

class TrackSeeder extends AbstractSeeder {
  constructor() {
    // dependencies ne peut lister que des AbstractSeeder : media n'en est pas un,
    // donc seul UserSeeder est déclaré ici. L'ordre avec tmdb:seed est géré à la main
    // (voir les étapes ci-dessous).
    super({ table: "track", truncate: true, dependencies: [UserSeeder] });
  }

  async run() {
    // 1. Récupérer les IDs media déjà en base (peuplés par npm run tmdb:seed)
    const [rows] = await database.query<Rows>("select ID from media");
    const mediaIds = (rows as { ID: number }[]).map((row) => row.ID);

    if (mediaIds.length === 0) {
      throw new Error(
        "Table media vide : lancez `npm run tmdb:seed` avant `npm run db:seed`.",
      );
    }

    // 2. Pour chacun des 4 users, tirer un échantillon aléatoire de médias
    //    sans doublon (respecte la clé composite ID_user + ID_media)
    for (let userIndex = 0; userIndex < 4; userIndex += 1) {
      const userId = this.getRef(`user_${userIndex}`).insertId;

      const sampleSize = this.faker.number.int({ min: 5, max: 15 });
      const pickedMediaIds = this.faker.helpers.arrayElements(
        mediaIds,
        Math.min(sampleSize, mediaIds.length),
      );

      for (const mediaId of pickedMediaIds) {
        // 3. Générer des valeurs plausibles
        const hasRated = this.faker.datatype.boolean({ probability: 0.6 });

        const fakeTrack = {
          ID_user: userId,
          ID_media: mediaId,
          favorite_media: this.faker.datatype.boolean({ probability: 0.3 }),
          // DECIMAL(2,1) → 1 chiffre avant la virgule, 1 après : 0.0 à 5.0 max
          user_rating: hasRated
            ? this.faker.number.float({ min: 0, max: 5.0, fractionDigits: 1 })
            : null,
          watchlist: this.faker.datatype.boolean({ probability: 0.4 }),
        };

        // 4. Insertion (pas de refName : aucune autre table ne référence "track")
        this.insert(fakeTrack);
      }
    }
  }
}

export default TrackSeeder;
