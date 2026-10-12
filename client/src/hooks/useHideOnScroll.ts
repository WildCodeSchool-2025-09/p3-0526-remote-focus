import { useEffect, useRef, useState } from "react";

const MIN_DELTA = 5;

function useHideOnScroll(topThreshold = 10): boolean {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < MIN_DELTA) {
        return;
      }

      if (currentScrollY <= topThreshold) {
        setIsHidden(false);
      } else {
        setIsHidden(delta > 0);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [topThreshold]);

  return isHidden;
}

export default useHideOnScroll;
