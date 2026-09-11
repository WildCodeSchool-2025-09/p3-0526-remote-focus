export function isWatchedClause(alias = "m"): string {
  return `CASE
    WHEN ${alias}.type = 'movie' THEN EXISTS(
      SELECT 1 FROM media_user AS mu WHERE mu.ID_media = ${alias}.ID AND mu.ID_user = ?
    )
    ELSE (
      SELECT COUNT(*) > 0 AND COUNT(*) = SUM(
        CASE WHEN EXISTS(
          SELECT 1 FROM episode_user AS eu WHERE eu.ID_episode = e.ID AND eu.ID_user = ?
        ) THEN 1 ELSE 0 END
      )
      FROM episode AS e
      JOIN season AS s ON s.ID = e.ID_season
      WHERE s.ID_media = ${alias}.ID
    )
  END`;
}
