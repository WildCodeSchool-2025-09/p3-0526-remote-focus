import { useEffect, useState } from "react";

const DISPLAY_DURATION = 4000;

export function useActionError() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorMessage(null);
    }, DISPLAY_DURATION);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorMessage]);

  return { errorMessage, showError: setErrorMessage };
}
