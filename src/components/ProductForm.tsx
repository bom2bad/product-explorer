"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORIES, ProductDraftSchema } from "@/lib/products";
import type { Product, ProductDraft } from "@/lib/products";

type ProductFormProps = {
  editing: Product | null;
  onSave: (values: ProductDraft) => void;
  onCancel: () => void;
};

export default function ProductForm({ editing, onSave, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<ProductDraft>({
    resolver: zodResolver(ProductDraftSchema),
    mode: "onTouched",
    defaultValues: editing
      ? { title: editing.title, price: editing.price, stock: editing.stock, category: editing.category }
      : { title: "", price: undefined, stock: undefined, category: undefined } as unknown as ProductDraft,
  });

  function saveProduct(values: ProductDraft) {
    onSave(values);
    reset({ title: "", price: undefined, stock: undefined, category: undefined } as unknown as ProductDraft);
  }

  return (
    <form className="product-form" onSubmit={handleSubmit(saveProduct)} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor="title">ชื่อสินค้า</label>
          <input id="title" required placeholder="เช่น Wireless Headphones" {...register("title")} aria-invalid={!!errors.title} aria-describedby="title-error" />
          <span className="field-error" id="title-error" role="alert">{errors.title?.message}</span>
        </div>
        <div className="field">
          <label htmlFor="price">ราคา <span className="field-hint">บาท</span></label>
          <input id="price" type="number" min="0" step="0.01" required placeholder="0.00" {...register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} aria-describedby="price-error" />
          <span className="field-error" id="price-error" role="alert">{errors.price?.message}</span>
        </div>
        <div className="field">
          <label htmlFor="stock">จำนวนคงเหลือ</label>
          <input id="stock" type="number" min="0" step="1" required placeholder="0" {...register("stock", { valueAsNumber: true })} aria-invalid={!!errors.stock} aria-describedby="stock-error" />
          <span className="field-error" id="stock-error" role="alert">{errors.stock?.message}</span>
        </div>
        <div className="field field-wide">
          <label htmlFor="category">หมวดหมู่</label>
          <select id="category" required defaultValue={editing?.category ?? ""} {...register("category")} aria-invalid={!!errors.category} aria-describedby="category-error">
            <option value="">เลือกหมวดหมู่สินค้า</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <span className="field-error" id="category-error" role="alert">{errors.category?.message}</span>
        </div>
      </div>
      <div className="form-actions">
        <button className="button button-primary" type="submit" disabled={!isDirty || !isValid || isSubmitting}>
          <span aria-hidden="true">{editing ? "✓" : "+"}</span> {editing ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
        </button>
        {editing && <button className="button button-quiet" type="button" onClick={onCancel}>ยกเลิก</button>}
        <span className="form-note">ข้อมูลจะถูกบันทึกไว้ในรายการนี้</span>
      </div>
    </form>
  );
}
