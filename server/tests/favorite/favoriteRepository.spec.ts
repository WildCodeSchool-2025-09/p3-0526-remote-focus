import { afterEach, describe, expect, it, jest } from "@jest/globals";
import databaseClient from "../../database/client";
import favoriteRepository from "../../src/modules/favorite/favoriteRepository";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("favoriteRepository.readFavoriteActors", () => {
  it("compte les visionnages des 3 sources, restreints aux favoris de l'utilisateur", async () => {
    const query = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([
        [{ ID: 1, name: "A", photo: null, viewed_count: 4 }],
      ] as never);

    const rows = await favoriteRepository.readFavoriteActors(7, 6, 0);

    expect(rows).toEqual([{ ID: 1, name: "A", photo: null, viewed_count: 4 }]);

    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];

    // media_user (①), episode_user via le casting de la série (②) et via le casting de l'épisode (③)
    expect(sql).toContain("FROM media_person AS mp");
    expect(sql).toContain("JOIN media_user AS mu");
    expect(sql).toContain("FROM episode_person AS ep");
    expect(sql.match(/JOIN episode_user AS eu/g)).toHaveLength(2);

    // chaque branche est filtrée sur les favoris avant l'agrégation
    expect(
      sql.match(/IN \(SELECT ID_person FROM favorite WHERE ID_user = \?\)/g),
    ).toHaveLength(3);

    // 3 branches × (utilisateur, filtre favoris) + WHERE f.ID_user + limit + offset
    expect(sql.match(/\?/g)).toHaveLength(params.length);
    expect(params).toEqual([7, 7, 7, 7, 7, 7, 7, 6, 0]);
  });
});
