import { useRef, type ReactNode } from "react";
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

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        className="carousel-nav"
        onClick={scrollLeft}
        aria-label="Défiler vers la gauche"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <div ref={carouselRef} className="carousel-container">
        {children}
      </div>
      <button
        type="button"
        className="carousel-nav"
        onClick={scrollRight}
        aria-label="Défiler vers la droite"
      >
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}

export default Carousel;
