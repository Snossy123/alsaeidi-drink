import { useState, useEffect, useCallback } from "react";

export interface GridLayoutConfig {
  cols: 1 | 2 | 3 | 4 | 5;
  rows: number;
  itemsPerPage: number;
}

function getCols(width: number): GridLayoutConfig["cols"] {
  if (width < 640) return 1;
  if (width < 1024) return 2;
  if (width < 1536) return 3;
  if (width < 1920) return 4;
  return 5;
}

function estimateCardHeight(width: number): number {
  const cols = getCols(width);
  if (cols === 1) return 200;
  if (cols === 2) return 190;
  return 175;
}

function computeLayout(width: number, containerHeight: number): GridLayoutConfig {
  const cols = getCols(width);
  const cardHeight = estimateCardHeight(width);
  const gap = cols <= 2 ? 12 : 16;
  const rows = Math.max(1, Math.floor((containerHeight + gap) / (cardHeight + gap)));
  const itemsPerPage = Math.min(Math.max(cols * rows, 4), 20);

  return { cols, rows, itemsPerPage };
}

export function useGridLayout(containerRef: React.RefObject<HTMLElement | null>) {
  const [config, setConfig] = useState<GridLayoutConfig>(() =>
    computeLayout(
      typeof window !== "undefined" ? window.innerWidth : 1920,
      typeof window !== "undefined" ? window.innerHeight * 0.5 : 500
    )
  );

  const update = useCallback(() => {
    const width = window.innerWidth;
    const height = containerRef.current?.clientHeight ?? window.innerHeight * 0.5;
    setConfig(computeLayout(width, height));
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

  return config;
}
