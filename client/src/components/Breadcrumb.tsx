import { Link } from "react-router";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

function Breadcrumb({ items }: BreadcrumbProps) {
  const isLong = items.length > 4;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-2 text-sm text-[#9FB4BD]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isHiddenOnMobile = isLong && index < 2;

        return (
          <span
            key={item.path ?? item.label}
            className={isHiddenOnMobile ? "hidden md:contents" : "contents"}
          >
            {isLast ? (
              <span aria-current="page" className="font-medium text-[#F2B705]">
                {item.label}
              </span>
            ) : item.path != null ? (
              <Link to={item.path} className="hover:text-[#F5F5F0]">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <span className="text-[#5E7079]">›</span>}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
