import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CarouselProps {
  children: ReactNode;
  title: string;
  icon?: ReactNode;
  isEmpty?: boolean;
}

function Carousel({ children, title, icon, isEmpty = false }: CarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  function handleScrollLeft() {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  }
  function handleScrollRight() {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  }

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  function handleScroll() {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;

      setIsAtStart(scrollLeft <= 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once to set the initial button state on mount
  useEffect(() => {
    handleScroll();
  }, []);

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-display font-semibold text-base-content">
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content">
            {icon}
          </span>
        )}
        {title}
      </h2>

      {isEmpty ? (
        <p className="italic text-base-content/60">Aucun contenu disponible</p>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            className={`hidden ${isAtStart ? "md:carousel-nav-disabled" : "md:carousel-nav"}`}
            onClick={handleScrollLeft}
            disabled={isAtStart}
            aria-label="Défiler vers la gauche"
          >
            <ChevronLeft aria-hidden="true" />
          </button>

          <div className="relative min-w-0 flex-1">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="carousel-container"
            >
              {children}
            </div>

            {!isAtEnd && (
              <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-base-100" />
            )}
          </div>

          <button
            type="button"
            className={`hidden ${isAtEnd ? "md:carousel-nav-disabled" : "md:carousel-nav"}`}
            onClick={handleScrollRight}
            disabled={isAtEnd}
            aria-label="Défiler vers la droite"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

export default Carousel;
