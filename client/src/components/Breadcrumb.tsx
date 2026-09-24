import { Fragment } from "react";
import { Link } from "react-router";

type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-2 text-sm text-[#9FB4BD]"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={item.label}>
            {item.to != null && !isLast ? (
              <Link to={item.to} className="hover:text-[#F5F5F0]">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "font-medium text-[#F2B705]" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-[#5E7079]">›</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
