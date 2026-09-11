import { Star } from "lucide-react";
import { useState } from "react";

const STAR_SIZE = 28;
const STAR_COLOR = "#F2B705";

type RatingInputProps = {
  value: number | null;
  onChange: (value: number) => void;
};

function RatingInput({ value, onChange }: RatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value ?? 0;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverValue(null)}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillRatio = Math.max(
          0,
          Math.min(1, displayValue - (starIndex - 1)),
        );

        return (
          <div
            key={starIndex}
            className="relative"
            style={{ width: STAR_SIZE, height: STAR_SIZE }}
          >
            <Star
              size={STAR_SIZE}
              color={STAR_COLOR}
              className="absolute inset-0"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillRatio * 100}%` }}
            >
              <Star size={STAR_SIZE} color={STAR_COLOR} fill={STAR_COLOR} />
            </div>
            <button
              type="button"
              className="absolute inset-y-0 left-0 w-1/2"
              aria-label={`${starIndex - 0.5} étoile${starIndex - 0.5 > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverValue(starIndex - 0.5)}
              onClick={() => onChange(starIndex - 0.5)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 w-1/2"
              aria-label={`${starIndex} étoile${starIndex > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverValue(starIndex)}
              onClick={() => onChange(starIndex)}
            />
          </div>
        );
      })}
    </div>
  );
}

export default RatingInput;
