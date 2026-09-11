import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CarouselProps {
  children: ReactNode;
}

function Carousel({ children }: CarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  function scrollLeft() {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  }
  function scrollRight() {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  }

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  function updateScrollButtons() {
    if (carouselRef.current) {
      const {scrollLeft, clientWidth, scrollWidth} = carouselRef.current;

      setIsAtStart(scrollLeft <= 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth -1)
    }
  }

  useEffect(() => {
      if (carouselRef.current) {
        const {scrollLeft, clientWidth, scrollWidth} = carouselRef.current;

        setIsAtStart(scrollLeft <= 0);
        setIsAtEnd(scrollLeft + clientWidth >= scrollWidth -1)
    }
  }, [])

  return (
    <div className="flex items-center gap-4">
  <button
    type="button"
    className={`hidden ${isAtStart ? "md:carousel-nav-disabled" : "md:carousel-nav"}`}
    onClick={scrollLeft}
    disabled={isAtStart}
    aria-label="Défiler vers la gauche"
  >
    <ChevronLeft aria-hidden="true" />
  </button>

  <div className="relative min-w-0 flex-1">
    <div
      ref={carouselRef}
      onScroll={updateScrollButtons}
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
    onClick={scrollRight}
    disabled={isAtEnd}
    aria-label="Défiler vers la droite"
  >
    <ChevronRight aria-hidden="true" />
  </button>
</div>
  );
}

export default Carousel;
