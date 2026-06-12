import { useRef, useCallback } from "react";

const SCROLL_THRESHOLD = 10;

export function useScrollTouchGuard() {
  const startY = useRef(0);
  const startX = useRef(0);
  const isScrolling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startY.current = touch.clientY;
    startX.current = touch.clientX;
    isScrolling.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - startY.current);
    const deltaX = Math.abs(touch.clientX - startX.current);
    if (deltaY > SCROLL_THRESHOLD || deltaX > SCROLL_THRESHOLD) {
      isScrolling.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    setTimeout(() => {
      isScrolling.current = false;
    }, 100);
  }, []);

  const guardAction = useCallback((action: () => void) => {
    return (e: React.MouseEvent) => {
      if (isScrolling.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      action();
    };
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, guardAction };
}
