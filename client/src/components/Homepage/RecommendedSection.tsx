import useFetch from "../../hooks/useFetch";
import type { EnrichedMedia } from "../../types/Catalog";
import MediaCardLoading from "../Catalog/MediaCardLoading";
import MediaSection from "../Catalog/MediaSection";

function RecommendedSection() {
  const { data, loading, error } = useFetch<{ forYou: EnrichedMedia[] }>(
    "/api/me/recommendations",
  );

  if (loading) {
    return (
      <section>
        <h3 className="mt-9 mb-4">Recommandés pour vous</h3>

        <div className="carousel flex">
          {Array.from({ length: 5 }, (_, index) => index).map((index) => (
            <MediaCardLoading key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.forYou.length === 0) {
    return null;
  }

  return (
    <MediaSection
      title="Recommandés pour vous"
      medias={data.forYou}
      showTypeIcon={true}
      showGenre={true}
    />
  );
}

export default RecommendedSection;
