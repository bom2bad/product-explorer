"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SORT_FIELDS,
  SearchQuerySchema,
  defaultQuery,
} from "@/lib/products";

import type {
  SearchQuery,
} from "@/lib/products";

type ProductSearchFormProps = {
  onSearch: (query: SearchQuery) => Promise<void>;
};

export default function ProductSearchForm(
  { onSearch }: ProductSearchFormProps
) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<SearchQuery>({
    resolver: zodResolver(SearchQuerySchema),
    mode: "onTouched",
    defaultValues: defaultQuery,
  });

  return (
    <form
      onSubmit={handleSubmit(onSearch)}
      noValidate
    >
      <div className="search-field">
        <label htmlFor="q">คำค้น</label>
        <input id="q" {...register("q")} placeholder="เช่น phone, laptop" />
      </div>

      <div className="search-field">
        <label htmlFor="limit">จำนวนรายการ</label>
        <input id="limit" type="number" min="1" max="30" required {...register("limit", { valueAsNumber: true })} aria-invalid={!!errors.limit} aria-describedby="limit-error" />
        <span className="field-error" id="limit-error" role="alert">{errors.limit?.message}</span>
      </div>

      <div className="search-field">
        <label htmlFor="sortBy">เรียงตาม</label>
        <select id="sortBy" {...register("sortBy")}>
          {SORT_FIELDS.map((field) => <option key={field} value={field}>{field}</option>)}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "กำลังค้นหา"
          : "⌕  ค้นหา"}
      </button>
    </form>
  );
}
