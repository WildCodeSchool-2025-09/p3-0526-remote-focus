import type { RequestHandler } from "express";
import {
  type ImportedMovie,
  fetchMovieForImport,
  fetchSeriesForImport,
} from "../../utils/tmdbClient";
import mediaImportRepository from "./mediaImportRepository";

async function importGenresAndCast(
  mediaId: number,
  media: ImportedMovie,
): Promise<void> {
  for (const genre of media.genres) {
    const genreId = await mediaImportRepository.upsertGenre(
      genre.id,
      genre.name,
    );
    await mediaImportRepository.linkGenre(mediaId, genreId);
  }

  for (const credit of media.cast) {
    const personId = await mediaImportRepository.upsertPerson(credit);
    await mediaImportRepository.linkPerson(mediaId, personId, credit);
  }
}

const importMedia: RequestHandler = async (req, res, next) => {
  try {
    const { type, tmdbId: tmdbIdParam } = req.params;
    const tmdbId = Number(tmdbIdParam);

    if (type !== "movie" && type !== "tv") {
      res.status(400).json({ error: "Invalid type" });
      return;
    }

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      res.status(400).json({ error: "Invalid tmdbId" });
      return;
    }

    const existingId = await mediaImportRepository.findExistingMediaId(
      type,
      tmdbId,
    );

    if (existingId != null) {
      res.json({ id: existingId, type });
      return;
    }

    if (type === "movie") {
      const movie = await fetchMovieForImport(tmdbId);

      if (movie == null) {
        res.status(404).json({ error: "Media not found on TMDB" });
        return;
      }

      const mediaId = await mediaImportRepository.insertMedia("movie", movie);
      await importGenresAndCast(mediaId, movie);

      res.status(201).json({ id: mediaId, type: "movie" });
      return;
    }

    const series = await fetchSeriesForImport(tmdbId);

    if (series == null) {
      res.status(404).json({ error: "Media not found on TMDB" });
      return;
    }

    const mediaId = await mediaImportRepository.insertMedia("tv", series);
    await importGenresAndCast(mediaId, series);

    for (const season of series.seasons) {
      const seasonId = await mediaImportRepository.insertSeason(
        mediaId,
        season,
      );

      for (const episode of season.episodes) {
        await mediaImportRepository.insertEpisode(seasonId, episode);
      }
    }

    res.status(201).json({ id: mediaId, type: "tv" });
  } catch (err) {
    next(err);
  }
};

export default { importMedia };
