import { useState, useEffect } from "react";

export interface GridColumnsConfig {
  cols: 1 | 2 | 3 | 4 | 5;
  itemsPerPage: number;
}

function getGridConfig(width: number): GridColumnsConfig {
  if (width < 640) return { cols: 1, itemsPerPage: 2 };
  if (width < 1024) return { cols: 2, itemsPerPage: 4 };
  if (width < 1536) return { cols: 3, itemsPerPage: 6 };
  if (width < 1920) return { cols: 4, itemsPerPage: 8 };
  return { cols: 5, itemsPerPage: 10 };
}

export function useGridColumns(): GridColumnsConfig {
  const [config, setConfig] = useState<GridColumnsConfig>(() =>
    getGridConfig(typeof window !== "undefined" ? window.innerWidth : 1920)
  );

  useEffect(() => {
    const handleResize = () => setConfig(getGridConfig(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return config;
}
