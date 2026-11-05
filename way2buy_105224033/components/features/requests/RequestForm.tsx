
"use client";

import { FormEvent, useState } from "react";
import type { Product } from "../../../lib/catalog/products";
import { orderSchema } from "@/lib/schema/order.schema";
import { createOrder } from "@/app/actions/order";

interface RequestFormProps {
  products: Product[];
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  destination: string;
  notes: string;
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  product: "",
  quantity: "1",
  destination: "",
  notes: "",
};

export function RequestForm({ products }: RequestFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] =
    useState<OrderResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setOrderResponse(null);
    setServerError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const validation = orderSchema.safeParse(values);

    if (!validation.success) {
      const nextErrors: FormErrors = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (
          typeof field === "string" &&
          field in values &&
          !nextErrors[field as keyof FormValues]
        ) {
          nextErrors[field as keyof FormValues] = issue.message;
        }
      }

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const data = await createOrder(validation.data);

      if (!data.success) {
        if (data.errors) {
          const nextErrors: FormErrors = {};

          for (const [field, messages] of Object.entries(data.errors)) {
            if (field in values && messages?.[0]) {
              nextErrors[field as keyof FormValues] = messages[0];
            }
          }

          setErrors(nextErrors);
        }

        throw new Error(data.message);
      }

      setOrderResponse({
        success: true,
        orderId: data.orderId,
        message: data.message,
      });

      setValues(initialValues);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="request-form" noValidate onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">
            Nama lengkap <span aria-hidden="true">*</span>
          </label>

          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            id="name"
            onChange={(event) => updateField("name", event.target.value)}
            required
            value={values.name}
          />

          {errors.name && (
            <p className="field-error" id="name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">
            Email <span aria-hidden="true">*</span>
          </label>

          <input
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            id="email"
            onChange={(event) => updateField("email", event.target.value)}
            required
            type="email"
            value={values.email}
          />

          {errors.email && (
            <p className="field-error" id="email-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="phone">
            Nomor WhatsApp <span aria-hidden="true">*</span>
          </label>

          <input
            aria-describedby={errors.phone ? "phone-error" : undefined}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            id="phone"
            inputMode="tel"
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder="08xxxxxxxxxx"
            required
            type="tel"
            value={values.phone}
          />

          {errors.phone && (
            <p className="field-error" id="phone-error">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="product">
            Produk yang ingin dititipkan{" "}
            <span aria-hidden="true">*</span>
          </label>

          <select
            aria-describedby={errors.product ? "product-error" : undefined}
            aria-invalid={Boolean(errors.product)}
            id="product"
            onChange={(event) => updateField("product", event.target.value)}
            required
            value={values.product}
          >
            <option value="">Pilih produk</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.origin}
              </option>
            ))}

            <option value="custom">
              Produk lain (tulis di catatan)
            </option>
          </select>

          {errors.product && (
            <p className="field-error" id="product-error">
              {errors.product}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="quantity">
            Jumlah <span aria-hidden="true">*</span>
          </label>

          <input
            aria-describedby={
              errors.quantity ? "quantity-error" : undefined
            }
            aria-invalid={Boolean(errors.quantity)}
            id="quantity"
            min="1"
            onChange={(event) => updateField("quantity", event.target.value)}
            required
            type="number"
            value={values.quantity}
          />

          {errors.quantity && (
            <p className="field-error" id="quantity-error">
              {errors.quantity}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="destination">
            Kota tujuan pengiriman{" "}
            <span aria-hidden="true">*</span>
          </label>

          <input
            aria-describedby={
              errors.destination ? "destination-error" : undefined
            }
            aria-invalid={Boolean(errors.destination)}
            autoComplete="address-level2"
            id="destination"
            onChange={(event) =>
              updateField("destination", event.target.value)
            }
            placeholder="Contoh: Jl. Diponegoro No. 12, Yogyakarta"
            required
            value={values.destination}
          />

          {errors.destination && (
            <p className="field-error" id="destination-error">
              {errors.destination}
            </p>
          )}
        </div>

        <div className="field field--full">
          <label htmlFor="notes">
            Catatan untuk jastiper{" "}
            <span className="optional-label">
              {values.product === "custom"
                ? "(wajib untuk produk lain)"
                : "(opsional)"}
            </span>
          </label>

          <textarea
            aria-describedby={errors.notes ? "notes-error" : undefined}
            aria-invalid={Boolean(errors.notes)}
            aria-required={values.product === "custom"}
            id="notes"
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Varian rasa, warna, tautan produk, atau detail lain..."
            rows={4}
            value={values.notes}
          />

          {errors.notes && (
            <p className="field-error" id="notes-error">
              {errors.notes}
            </p>
          )}
        </div>
      </div>

      <p className="form-note"></p>

      <button
        className="button form-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? "Mengenkripsi & Mengirim..."
          : "Kirim permintaan aman "}
        <span aria-hidden="true">↗</span>
      </button>

      {serverError && (
        <div
          className="form-summary"
          role="alert"
          style={{ marginTop: "1rem" }}
        >
          <strong>Peringatan Server:</strong> {serverError}
        </div>
      )}

      {orderResponse && (
        <p id="form-success" role="status">
          <strong>✓ Permintaan berhasil disimpan!</strong>{" "}
          Nomor pesanan: {orderResponse.orderId}
        </p>
      )}

      {Object.keys(errors).length > 0 && (
        <p className="form-summary" role="alert">
          Masih ada {Object.keys(errors).length} bagian yang perlu diperiksa.
          Perbaiki isian yang ditandai di atas.
        </p>
      )}
    </form>
  );
}
