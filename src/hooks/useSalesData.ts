import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/constants";

export interface Product {
  id: string | number;
  name: string;
  image?: string;
  stock: number;
  price?: number;
  s_price?: number;
  m_price?: number;
  l_price?: number;
  hasSizes: boolean;
  category_id?: string;
  barcode?: string;
}

export interface Category {
  id: string;
  name: string;
  // Add other category fields if needed
}

export interface Employee {
  id: number;
  name: string;
}

export const useSalesData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, employeesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/employees`)
        ]);

        const [productsData, categoriesData, employeesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          employeesRes.json()
        ]);

        if (productsData.status === "success") setProducts(productsData.products);
        if (categoriesData.status === "success") setCategories(categoriesData.categories);
        if (employeesData.status === "success") setEmployees(employeesData.employees);

      } catch (error: any) {
        toast({
          title: "فشل التحميل",
          description: error.message || "تحقق من الاتصال بالإنترنت",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return { products, categories, employees, loading };
};
