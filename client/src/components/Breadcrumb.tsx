import { Link } from "react-router";

type BreadcrumbProps = {
  currentLabel: string;
  categoryLabel?: string;
  categoryPath?: string;
};

function Breadcrumb({
  currentLabel,
  categoryLabel = "Films",
  categoryPath = "/catalog?type=movie",
}: BreadcrumbProps) {
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
      <Link to={categoryPath} className="hover:text-[#F5F5F0]">
        {categoryLabel}
      </Link>
      <span className="text-[#5E7079]">›</span>
      <span className="font-medium text-[#F2B705]">{currentLabel}</span>
    </nav>
  );
}

export default Breadcrumb;
