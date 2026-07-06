import { useState, useEffect, useCallback } from "react";

function getGridCols(width: number): number {
  if (width < 640) return 2;
  if (width < 768) return 3;
  if (width < 1024) return 4;
  if (width < 1536) return 5;
  return 6;
}

const CARD_HEIGHT = 120;
const CARD_GAP = 12;
const PAGINATION_HEIGHT = 56;
const MIN_ITEMS = 8;
const MAX_ITEMS = 36;

function computeItemsPerPage(width: number, containerHeight: number): number {
  const cols = getGridCols(width);
  const available = containerHeight - PAGINATION_HEIGHT;
  const rows = Math.max(1, Math.floor((available + CARD_GAP) / (CARD_HEIGHT + CARD_GAP)));
  return Math.min(Math.max(cols * rows, MIN_ITEMS), MAX_ITEMS);
}

export function useGridCategoryItemsPerPage(
  containerRef: React.RefObject<HTMLElement | null>
) {
  const [itemsPerPage, setItemsPerPage] = useState(MIN_ITEMS);

  const update = useCallback(() => {
    const width = window.innerWidth;
    const height =
      containerRef.current?.clientHeight ??
      Math.max(300, window.innerHeight * 0.35);
    setItemsPerPage(computeItemsPerPage(width, height));
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
