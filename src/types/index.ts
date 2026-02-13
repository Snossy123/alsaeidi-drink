export interface Category {
  id: string | number;
  name: string;
  description?: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  barcode: string;
  category_id?: number | null;
  hasSizes: boolean;
  price: number;
  s_price?: number;
  m_price?: number;
  l_price?: number;
  image?: string; // Base64 string or URL
}
