import { useState, useEffect, useCallback } from "react";

const HEADER_HEIGHT = 28;
const ALL_BUTTON_HEIGHT = 32;
const PAGINATION_HEIGHT = 36;
const GAPS = 24;
const BUTTON_HEIGHT = 32;
const BUTTON_GAP = 6;
const MIN_ITEMS = 6;
const MAX_ITEMS = 15;

function computeItemsPerPage(sidebarHeight: number): number {
  const available =
    sidebarHeight - HEADER_HEIGHT - ALL_BUTTON_HEIGHT - PAGINATION_HEIGHT - GAPS;
  const count = Math.floor(available / (BUTTON_HEIGHT + BUTTON_GAP));
  return Math.min(Math.max(count, MIN_ITEMS), MAX_ITEMS);
}

export function useCategoryItemsPerPage(
  containerRef: React.RefObject<HTMLElement | null>
) {
  const [itemsPerPage, setItemsPerPage] = useState(MIN_ITEMS);

  const update = useCallback(() => {
    const height = containerRef.current?.clientHeight ?? window.innerHeight;
    setItemsPerPage(computeItemsPerPage(height));
  }, [containerRef]);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);

    const el = containerRef.current;
    const observer = el ? new ResizeObserver(update) : null;
    if (el && observer) observer.observe(el);

    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [update, containerRef]);

  return itemsPerPage;
}
