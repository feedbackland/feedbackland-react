import { useLayoutEffect } from "react";

export const useScrollLock = (isLocked: boolean) => {
  useLayoutEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isLocked) {
      // Prevent scrolling on mount
      document.body.style.overflow = "hidden";
    }

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]); // Only re-run effect if isLocked changes
};
