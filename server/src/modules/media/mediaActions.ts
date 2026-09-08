import type { RequestHandler } from "express";
import mediaRepository from "./mediaRepository";

const read: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            res.sendStatus(400);
            return;
        }

        const movie = await mediaRepository.read(id);

        if (movie == null) {
            res.sendStatus(404);
            return;
        }

        const [genres, platforms, cast, castTotal] = await Promise.all([
            mediaRepository.readGenres(id),
            mediaRepository.readPlatforms(id),
            mediaRepository.readCast(id),
            mediaRepository.countCast(id),
        ]);

        res.json({
            id: movie.ID,
            name: movie.name,
            originalName: movie.original_name,
            poster: movie.poster,
            synopsis: movie.synopsis,
            duration: movie.duration,
            releasedAt: movie.released_at,
            overallRating: movie.overall_rating,
            originalLanguage: movie.original_language,
            pegi: movie.pegi,
            genres,
            platforms,
            cast: cast.map((person) => ({
                id: person.ID,
                name: person.name,
                photo: person.photo,
                characterName: person.personnage_name,
                role: person.role,
            })),
            castTotal,
            userStatus: null,
            userRating: null,
        });
    } catch (err) {
        next(err);
    }
};

export default { read };