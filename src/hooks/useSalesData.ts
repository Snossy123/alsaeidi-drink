import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { cacheCategories, cacheProducts, getCachedCategories, getCachedProducts } from "@/lib/offline/syncQueue";

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
        const [productsData, categoriesData, employeesData] = await Promise.all([
          apiClient<{ status: string; products: Product[] }>("/products"),
          apiClient<{ status: string; categories: Category[] }>("/categories"),
          apiClient<{ status: string; employees: Employee[] }>("/employees"),
        ]);

        if (productsData.status === "success") {
          setProducts(productsData.products);
          await cacheProducts(productsData.products);
        }
        if (categoriesData.status === "success") {
          setCategories(categoriesData.categories);
          await cacheCategories(categoriesData.categories);
        }
        if (employeesData.status === "success") setEmployees(employeesData.employees);
      } catch (error: any) {
        const cachedProducts = await getCachedProducts<Product[]>();
        const cachedCategories = await getCachedCategories<Category[]>();

        if (cachedProducts?.length) setProducts(cachedProducts);
        if (cachedCategories?.length) setCategories(cachedCategories);

        toast({
          title: cachedProducts?.length ? "وضع أوفلاين" : "فشل التحميل",
          description: error.message || "تحقق من الاتصال بالإنترنت",
          variant: cachedProducts?.length ? "default" : "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return { products, categories, employees, loading };
};
