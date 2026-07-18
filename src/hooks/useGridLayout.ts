import { useState, useEffect, useCallback } from "react";

export interface GridLayoutConfig {
  cols: 3 | 4 | 5 | 6 | 8;
  rows: number;
  itemsPerPage: number;
}

function getCols(width: number): GridLayoutConfig["cols"] {
  if (width < 640) return 3;
  if (width < 1024) return 4;
  if (width < 1536) return 5;
  if (width < 1920) return 6;
  return 8;
}

function estimateCardHeight(width: number): number {
  const cols = getCols(width);
  if (cols <= 3) return 155;
  if (cols <= 5) return 145;
  return 140;
}

function computeLayout(width: number, containerHeight: number): GridLayoutConfig {
  const cols = getCols(width);
  const cardHeight = estimateCardHeight(width);
  const gap = 6;
  const rows = Math.max(1, Math.floor((containerHeight + gap) / (cardHeight + gap)));
  const itemsPerPage = Math.min(Math.max(cols * rows, 9), 40);

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
