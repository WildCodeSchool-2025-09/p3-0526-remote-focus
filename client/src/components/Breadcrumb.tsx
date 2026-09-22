import { Link } from "react-router";

type BreadcrumbProps = {
  currentLabel: string;
  categoryLabel?: string;
  categoryPath?: string;
  parentLabel?: string;
  parentPath?: string;
};

function Breadcrumb({
  currentLabel,
  categoryLabel = "Films",
  categoryPath = "/catalog?type=movie",
  parentLabel,
  parentPath,
}: BreadcrumbProps) {
  const hasParent = parentLabel != null && parentPath != null;
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-2 text-sm text-[#9FB4BD]"
    >
      <span className={hasParent ? "hidden md:contents" : "contents"}>
        <Link to="/" className="hover:text-[#F5F5F0]">
          Accueil
        </Link>
        <span className="text-[#5E7079]">›</span>
        <Link to="/catalog" className="hover:text-[#F5F5F0]">
          Catalogue
        </Link>
        <span className="text-[#5E7079]">›</span>
      </span>
      <Link to={categoryPath} className="hover:text-[#F5F5F0]">
        {categoryLabel}
      </Link>
      {hasParent && (
        <>
          <span className="text-[#5E7079]">›</span>
          <Link to={parentPath} className="hover:text-[#F5F5F0]">
            {parentLabel}
          </Link>
        </>
      )}
      <span className="text-[#5E7079]">›</span>
      <span className="font-medium text-[#F2B705]">{currentLabel}</span>
    </nav>
  );
}

export default Breadcrumb;
