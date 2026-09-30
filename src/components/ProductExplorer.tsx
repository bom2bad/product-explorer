"use client";

import { useEffect, useMemo, useState } from "react";
import fallbackProducts from "@/data/products-fallback.json";
import { defaultQuery, fetchProducts, ProductListSchema } from "@/lib/products";
import type { Product, ProductDraft, ProductList, SearchQuery } from "@/lib/products";
import ProductForm from "./ProductForm";
import ProductSearchForm from "./ProductSearchForm";

type LoadState = "loading" | "error" | "ready";
const validatedFallback = ProductListSchema.parse({
  products: fallbackProducts,
  total: fallbackProducts.length,
  skip: 0,
  limit: fallbackProducts.length,
}).products;

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFallback, setIsFallback] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
    setErrorMessage("");
    setIsFallback(false);
    setLastUpdated(new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
  }

  function showError(error: unknown) {
    setErrorMessage(error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ");
    setStatus("error");
  }

  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");
    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      if (query.q === "" && query.limit === defaultQuery.limit) {
        setProducts(validatedFallback);
        setIsFallback(true);
        setStatus("ready");
        setLastUpdated("ข้อมูลสำรอง");
        setErrorMessage(error instanceof Error ? error.message : "เชื่อมต่อ API ไม่ได้");
      } else {
        showError(error);
      }
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch((error: unknown) => {
      setProducts(validatedFallback);
      setIsFallback(true);
      setStatus("ready");
      setLastUpdated("ข้อมูลสำรอง");
      setErrorMessage(error instanceof Error ? error.message : "เชื่อมต่อ API ไม่ได้");
    });
  }, []);

  function saveProduct(draft: ProductDraft) {
    if (editing) {
      setProducts((current) => current.map((product) => product.id === editing.id ? { ...draft, id: product.id } : product));
      setEditing(null);
      return;
    }
    setProducts((current) => [{ ...draft, id: Date.now() }, ...current]);
  }

  function removeProduct(id: number) {
    setProducts((current) => current.filter((product) => product.id !== id));
    if (editing?.id === id) setEditing(null);
  }

  const totalValue = useMemo(() => products.reduce((sum, product) => sum + product.price * product.stock, 0), [products]);
  const stockCount = useMemo(() => products.reduce((sum, product) => sum + product.stock, 0), [products]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Stockroom หน้าหลัก"><span className="brand-mark">S</span><span>stockroom<span className="brand-dot">.</span></span></a>
        <div className="topbar-right"><span className="topbar-label">พื้นที่จัดการสินค้า</span><span className="avatar" aria-label="ผู้ดูแลระบบ">A</span></div>
      </header>

      <div className="dashboard" id="top">
        <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> INVENTORY OVERVIEW</div><h1>จัดการสินค้า</h1><p className="page-subtitle">ดูแลรายการสินค้าและสต็อกของคุณได้ในที่เดียว</p></div>
          <button type="button" className="button button-refresh" onClick={() => loadProducts(defaultQuery)} disabled={status === "loading"}><span aria-hidden="true" className={status === "loading" ? "spin" : ""}>↻</span> โหลดข้อมูลใหม่</button>
        </div>

        <section className="stats-grid" aria-label="สรุปภาพรวม">
          <article className="stat-card"><div className="stat-top"><span className="stat-label">สินค้าทั้งหมด</span><span className="stat-icon icon-violet">▦</span></div><div className="stat-number">{status === "loading" ? "—" : products.length}</div><div className="stat-caption">รายการในคลัง</div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-label">จำนวนคงเหลือ</span><span className="stat-icon icon-blue">◫</span></div><div className="stat-number">{status === "loading" ? "—" : stockCount.toLocaleString("th-TH")}</div><div className="stat-caption">ชิ้นพร้อมจำหน่าย</div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-label">มูลค่าสต็อก</span><span className="stat-icon icon-green">฿</span></div><div className="stat-number stat-currency">{status === "loading" ? "—" : `฿${totalValue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`}</div><div className="stat-caption">คำนวณจากราคา × จำนวน</div></article>
        </section>

        <section className="panel search-panel">
          <div className="section-heading"><div><h2>ค้นหาสินค้า</h2><p>กรองรายการตามชื่อและเลือกวิธีเรียงลำดับ</p></div><span className="section-step">01</span></div>
          <ProductSearchForm onSearch={loadProducts} />
        </section>

        <section className="panel form-panel">
          <div className="section-heading"><div><h2>{editing ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2><p>{editing ? "ปรับปรุงรายละเอียดสินค้าในรายการ" : "กรอกรายละเอียดเพื่อเพิ่มสินค้าเข้ารายการ"}</p></div><span className="section-step">02</span></div>
          <ProductForm key={editing?.id ?? "new-product"} editing={editing} onSave={saveProduct} onCancel={() => setEditing(null)} />
        </section>

        <section className="panel inventory-panel">
          <div className="inventory-heading"><div className="section-heading"><div><h2>รายการสินค้า</h2><p>ข้อมูลสินค้าในคลังของคุณ</p></div></div><div className="inventory-meta"><span className={`source-badge ${isFallback ? "source-offline" : ""}`}><span />{isFallback ? "ข้อมูลสำรอง" : "เชื่อมต่อ API"}</span><span className="updated-label">อัปเดต {lastUpdated || "—"}</span></div></div>
          {errorMessage && isFallback && <div className="notice notice-info" role="status"><span aria-hidden="true">ⓘ</span> กำลังแสดงข้อมูลสำรอง เนื่องจากเชื่อมต่อแหล่งข้อมูลหลักไม่ได้</div>}
          {status === "loading" && <div className="state-message"><span className="loader" />กำลังโหลดรายการสินค้า</div>}
          {status === "error" && <div className="state-message state-error" role="alert"><span>!</span><div><strong>โหลดข้อมูลไม่สำเร็จ</strong><p>{errorMessage}</p></div></div>}
          {status === "ready" && products.length === 0 && <div className="empty-state"><span className="empty-icon">⌕</span><strong>ไม่พบสินค้าที่ตรงกับเงื่อนไข</strong><span>ลองเปลี่ยนคำค้นหาแล้วค้นหาอีกครั้ง</span></div>}
          {status === "ready" && products.length > 0 && <div className="table-wrap"><table className="product-table"><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>คงเหลือ</th><th className="actions-heading">จัดการ</th></tr></thead><tbody>{products.map((item) => <tr key={item.id}><td><div className="product-cell"><span className="product-thumbnail">{item.title.slice(0, 1).toUpperCase()}</span><span className="product-title">{item.title}</span></div></td><td><span className="category-pill">{item.category}</span></td><td className="price-cell">฿{item.price.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td><span className={`stock-value ${item.stock < 10 ? "stock-low" : ""}`}><span />{item.stock} ชิ้น</span></td><td><div className="row-actions"><button type="button" className="icon-button edit-action" onClick={() => setEditing(item)} aria-label={`แก้ไข ${item.title}`} title="แก้ไข">✎</button><button type="button" className="icon-button delete-action" onClick={() => removeProduct(item.id)} aria-label={`ลบ ${item.title}`} title="ลบ">⌫</button></div></td></tr>)}</tbody></table></div>}
          <div className="table-footer"><span>แสดง <strong>{status === "ready" ? products.length : 0}</strong> รายการ</span><span className="footer-dot" /> <span>ระบบจัดการสต็อก</span></div>
        </section>
        <footer className="page-footer"><span>STOCKROOM <span className="brand-dot">•</span> PRODUCT MANAGEMENT</span><span>จัดการง่าย สต็อกเป็นระเบียบ</span></footer>
      </div>
    </main>
  );
}
