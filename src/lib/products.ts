import { z } from "zod";

// รายชื่อหมวดหมู่ คัดลอกจาก
// https://dummyjson.com/products/category-list
export const CATEGORIES = [
  "beauty", "fragrances", "furniture", "groceries",
  "home-decoration", "kitchen-accessories", "laptops",
  "mens-shirts", "mens-shoes", "mens-watches",
  "mobile-accessories", "motorcycle", "skin-care",
  "smartphones", "sports-accessories", "sunglasses",
  "tablets", "tops", "vehicle", "womens-bags",
  "womens-dresses", "womens-jewellery", "womens-shoes", "womens-watches",
] as const;

export const ProductSchema = z.object({
  id: z.number(),
  // เติม: เงื่อนไขที่บังคับว่าข้อความต้องยาวอย่างน้อยเท่าใด
  title: z.string().trim().min(2, "กรุณากรอกชื่อสินค้า"),
  price: z.number({ error: "กรุณากรอกราคา" }).min(0, "ราคาต้องไม่ติดลบ"),
  stock: z
    .number({ error: "กรุณากรอกจำนวนคงเหลือ" })
    .int("จำนวนคงเหลือต้องเป็นจำนวนเต็ม")
    .min(0, "จำนวนคงเหลือต้องไม่ติดลบ"),
  category: z.enum(CATEGORIES, { error: "กรุณาเลือกหมวดหมู่" }),
});

export const ProductListSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export const ProductDraftSchema = ProductSchema.omit({ id: true });

// เติม: ตัวช่วยของ Zod ที่อ่าน Type ออกมาจาก Schema
export type Product     = z.infer<typeof ProductSchema>;
export type ProductList = z.infer<typeof ProductListSchema>;
export type ProductDraft = z.infer<typeof ProductDraftSchema>;

const API_BASE = "https://dummyjson.com";

export const SORT_FIELDS = ["title", "price", "stock"] as const;

export const SearchQuerySchema = z.object({
  q: z.string().trim(),

  limit: z
    .number({ error: "กรุณากรอกจำนวนรายการ" })
    .int("จำนวนรายการต้องเป็นจำนวนเต็ม")
    .min(1, "อย่างน้อย 1 รายการ")
    .max(30, "ไม่เกิน 30 รายการ"),

  sortBy: z.enum(SORT_FIELDS),
});

export type SearchQuery =
  z.infer<typeof SearchQuerySchema>;

export const defaultQuery: SearchQuery = {
  q: "",
  limit: 10,
  sortBy: "title",
};

export function buildProductUrl(query: SearchQuery): string {
  const params = new URLSearchParams();
  params.set("q", query.q);
  // เติม: เมธอดที่กำหนดค่าให้พารามิเตอร์หนึ่งตัว
  params.set("limit", String(query.limit));
  params.set("sortBy", query.sortBy);
  params.set("order", "asc");
  params.set("select", "title,price,stock,category");

  return `${API_BASE}/products/search?${params.toString()}`;
}

export async function fetchProducts(
  query: SearchQuery
): Promise<ProductList> {
  const response = await fetch(buildProductUrl(query));

  // เติม: ค่าที่บอกว่าสถานะการตอบกลับอยู่ในช่วง 200 ถึง 299 หรือไม่
  if (!response.ok) {
    throw new Error(`เรียกข้อมูลไม่สำเร็จ สถานะ ${response.status}`);
  }

  // เติม: เมธอดที่อ่านเนื้อหาการตอบกลับเป็น JSON
  const data = await response.json();

  // เติม: เมธอดที่ตรวจข้อมูลแล้วคืนผลลัพธ์แทนการโยน Error
  const result = ProductListSchema.safeParse(data);

  if (!result.success) {
    throw new Error("รูปแบบข้อมูลที่ได้รับไม่ตรงกับที่กำหนดไว้");
  }

  return result.data;
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/products/category-list`);
  if (!response.ok) {
    throw new Error(`เรียกหมวดหมู่ไม่สำเร็จ สถานะ ${response.status}`);
  }
  const result = z.array(z.string()).safeParse(await response.json());
  if (!result.success) {
    throw new Error("รูปแบบหมวดหมู่ที่ได้รับไม่ถูกต้อง");
  }
  return result.data;
}
