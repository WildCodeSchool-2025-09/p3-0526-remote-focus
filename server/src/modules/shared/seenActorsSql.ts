// Avec restrictToFavorites, chaque branche ajoute un paramètre (l'id de
// l'utilisateur) juste après le sien : 6 paramètres au lieu de 3.
export const buildSeenActorMediasSql = (restrictToFavorites = false) => {
  const onlyFavorites = (personColumn: string) =>
    restrictToFavorites
      ? `AND ${personColumn} IN (SELECT ID_person FROM favorite WHERE ID_user = ?)`
      : "";

  return `
  (SELECT mp.ID_person, mp.ID_media
   FROM media_person AS mp
   JOIN media_user AS mu ON mu.ID_media = mp.ID_media
   WHERE mu.ID_user = ? AND mp.role = 'actor' ${onlyFavorites("mp.ID_person")})
  UNION
  (SELECT mp.ID_person, s.ID_media
   FROM media_person AS mp
   JOIN season AS s ON s.ID_media = mp.ID_media
   JOIN episode AS e ON e.ID_season = s.ID
   JOIN episode_user AS eu ON eu.ID_episode = e.ID
   WHERE eu.ID_user = ? AND mp.role = 'actor' ${onlyFavorites("mp.ID_person")})
  UNION
  (SELECT ep.ID_person, s.ID_media
   FROM episode_person AS ep
   JOIN episode AS e ON e.ID = ep.ID_episode
   JOIN season AS s ON s.ID = e.ID_season
   JOIN episode_user AS eu ON eu.ID_episode = e.ID
   WHERE eu.ID_user = ? AND ep.role = 'actor' ${onlyFavorites("ep.ID_person")})
`;
};

export const SEEN_ACTOR_MEDIAS_SQL = buildSeenActorMediasSql();
