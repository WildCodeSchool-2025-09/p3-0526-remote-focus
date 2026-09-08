import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchMedia } from "../services/api";
import type { Media } from "../types/media";
import { formatDuration } from "../utils/formatDuration";

function MovieDetail() {
    const { id } = useParams();

    const [mediaDetail, setMediaDetail] = useState<Media | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id == null) {
            return;
        }

        setLoading(true);
        setError(null);

        fetchMedia(Number(id))
            .then((data) => setMediaDetail(data))
            .catch(() => setError("Ce film est introuvable."))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <p className="p-8 text-focus-muted">Chargement…</p>;
    }

    if (error != null || mediaDetail == null) {
        return <p className="p-8 text-focus-muted">{error ?? "Erreur"}</p>;
    }

    return (
        <div className="min-h-screen bg-base-100 p-8 space-y-4">
            <h1 className="text-4xl">{mediaDetail.name}</h1>
            <p>{formatDuration(mediaDetail.duration)}</p>
            <p>{mediaDetail.synopsis}</p>
        </div>
    );
}

export default MovieDetail;