"use client";

import { useState } from "react";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type {
  Product,
  ProductList,
  SearchQuery,
} from "@/lib/products";

import ProductSearchForm from "./ProductSearchForm";

type LoadState = "idle" | "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");

    console.log(
      "พบสินค้า",
      list.total,
      "รายการ",
      list.products,
    );
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "เรียกข้อมูลไม่สำเร็จ",
    );
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }

  return (
    <main>
      <h1>รายการสินค้า</h1>

      {/* ฟอร์มค้นหา */}
      <ProductSearchForm onSearch={loadProducts} />

      <button
        type="button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading"
          ? "กำลังโหลด"
          : "โหลดข้อมูล"}
      </button>

      <section aria-live="polite">
        {status === "idle" && (
          <p>คลิกปุ่มโหลดข้อมูลเพื่อเริ่ม</p>
        )}

        {status === "loading" && (
          <p>กำลังโหลดข้อมูล</p>
        )}

        {status === "error" && (
          <p role="alert">{errorMessage}</p>
        )}

        {status === "ready" &&
          products.length === 0 && (
            <p>
              ไม่พบสินค้าที่ตรงกับเงื่อนไข
            </p>
          )}

        {status === "ready" &&
          products.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>ชื่อสินค้า</th>
                  <th>ราคา</th>
                  <th>คงเหลือ</th>
                  <th>หมวดหมู่</th>
                </tr>
              </thead>

              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.price}</td>
                    <td>{item.stock}</td>
                    <td>{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </section>
    </main>
  );
}