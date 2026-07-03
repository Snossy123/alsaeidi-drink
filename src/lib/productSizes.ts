export type ProductSize = "s" | "m" | "l";

export interface ProductSizeOption {
  key: ProductSize;
  label: string;
  price: number;
  bg: string;
  border: string;
  labelColor: string;
  priceColor: string;
}

const SIZE_META = [
  {
    key: "s" as const,
    label: "صغير (S)",
    priceKey: "s_price" as const,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-700",
    labelColor: "text-blue-700 dark:text-blue-300",
    priceColor: "text-blue-900 dark:text-blue-100",
  },
  {
    key: "m" as const,
    label: "وسط (M)",
    priceKey: "m_price" as const,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-700",
    labelColor: "text-purple-700 dark:text-purple-300",
    priceColor: "text-purple-900 dark:text-purple-100",
  },
  {
    key: "l" as const,
    label: "كبير (L)",
    priceKey: "l_price" as const,
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-700",
    labelColor: "text-emerald-700 dark:text-emerald-300",
    priceColor: "text-emerald-900 dark:text-emerald-100",
  },
];

type ProductWithPrices = {
  s_price?: number | string | null;
  m_price?: number | string | null;
  l_price?: number | string | null;
};

export const getProductSizeOptions = (product: ProductWithPrices): ProductSizeOption[] =>
  SIZE_META.map((size) => ({
    key: size.key,
    label: size.label,
    price: Number(product[size.priceKey] ?? 0),
    bg: size.bg,
    border: size.border,
    labelColor: size.labelColor,
    priceColor: size.priceColor,
  })).filter((size) => size.price > 0);

export const getProductSizePrice = (
  product: ProductWithPrices,
  size: ProductSize
): number | undefined => {
  const option = getProductSizeOptions(product).find((item) => item.key === size);
  return option?.price;
};
