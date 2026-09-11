import { useEffect, useState } from "react";

const useDebounce = <Value>(value: Value, delayMs: number): Value => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const TimeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(TimeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
};
export default useDebounce;
