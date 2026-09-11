import { Link } from "react-router";

type BreadcrumbProps = {
  currentLabel: string;
  format?: "movie" | "tv";
};

const FORMAT_LABEL: Record<"movie" | "tv", string> = {
  movie: "Films",
  tv: "Séries",
};

function Breadcrumb({ currentLabel, format = "movie" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-2 text-sm text-[#9FB4BD]"
    >
      <Link to="/" className="hover:text-[#F5F5F0]">
        Accueil
      </Link>
      <span className="text-[#5E7079]">›</span>
      <Link to="/catalog" className="hover:text-[#F5F5F0]">
        Catalogue
      </Link>
      <span className="text-[#5E7079]">›</span>
      <Link to={`/catalog?type=${format}`} className="hover:text-[#F5F5F0]">
        {FORMAT_LABEL[format]}
      </Link>
      <span className="text-[#5E7079]">›</span>
      <span className="font-medium text-[#F2B705]">{currentLabel}</span>
    </nav>
  );
}

export default Breadcrumb;
