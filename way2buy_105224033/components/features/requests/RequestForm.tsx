"use client";

import { FormEvent, useState } from "react";
import { products } from "../../../lib/catalog/products";
import { orderSchema } from "@/lib/schema/order.schema";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  product: string;
  quantity: string;
  destination: string;
  notes: string;
}

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

interface OrderResponse {
  success: boolean;
  orderId: string;
  message: string;
  order: {
    orderId: string;
    customerName: string;
    product: string;
    quantity: number;
    encryptedDestination: EncryptedData;
    protection: {
      algorithm: string;
      assetId: string;
      assetName: string;
      securityObjective: string;
    };
    createdAt: string;
  };
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

export function RequestForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(
    null,
  );
  const [showCryptoDetails, setShowCryptoDetails] = useState(false);
  const [decryptedAddress, setDecryptedAddress] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setOrderResponse(null);
    setServerError(null);
    setDecryptedAddress(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    setDecryptedAddress(null);

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
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses pesanan di server.");
      }

      setOrderResponse(data);
      setShowCryptoDetails(true);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses data ke server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyDecryption() {
    if (!orderResponse?.order?.encryptedDestination) return;
    setIsDecrypting(true);
    setServerError(null);
    try {
      const res = await fetch("/api/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "decrypt",
          data: orderResponse.order.encryptedDestination,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verifikasi dekripsi gagal.");
      }

      setDecryptedAddress(data.address);
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Verifikasi dekripsi gagal dijalankan.",
      );
    } finally {
      setIsDecrypting(false);
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
            Produk yang ingin dititipkan <span aria-hidden="true">*</span>
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
            <option value="custom">Produk lain (tulis di catatan)</option>
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
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
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
            Kota tujuan pengiriman <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby={
              errors.destination ? "destination-error" : undefined
            }
            aria-invalid={Boolean(errors.destination)}
            autoComplete="address-level2"
            id="destination"
            onChange={(event) => updateField("destination", event.target.value)}
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
        {isSubmitting ? "Mengenkripsi & Mengirim..." : "Kirim permintaan aman "}
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
        <div
          id="form-success"
          role="status"
          style={{
            marginTop: "1.5rem",
            padding: "1.25rem",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "12px",
            color: "#166534",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <strong style={{ fontSize: "1.05rem" }}>
              ✅ Permintaan #{orderResponse.orderId} Berhasil Disimpan!
            </strong>
            <span
              style={{
                fontSize: "0.75rem",
                background: "#285a49",
                color: "#ffffff",
                padding: "4px 8px",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              AES-256-GCM ENCRYPTED
            </span>
          </div>

          <p
            style={{
              marginTop: "0.5rem",
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
            }}
          >
            Pesanan untuk <strong>{orderResponse.order.customerName}</strong>{" "}
            telah diterima. Alamat pengiriman konsumen (Aset <code>D-05</code>)
            telah diamankan menggunakan enkripsi autentikasi AES-256-GCM.
          </p>

          <button
            type="button"
            onClick={() => setShowCryptoDetails(!showCryptoDetails)}
            style={{
              background: "transparent",
              border: "1px solid #166534",
              color: "#166534",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            {showCryptoDetails
              ? "Sembunyikan Detail Kriptografi ▲"
              : "Lihat Detail Kriptografi (Ciphertext, IV, Tag) ▼"}
          </button>

          {showCryptoDetails && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #bbf7d0",
                fontSize: "0.85rem",
                color: "#1e293b",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 600, color: "#475569" }}>
                  Ciphertext (Base64):
                </span>
                <code
                  style={{
                    display: "block",
                    background: "#f1f5f9",
                    padding: "6px 8px",
                    borderRadius: "4px",
                    wordBreak: "break-all",
                    marginTop: "2px",
                    fontSize: "0.8rem",
                  }}
                >
                  {orderResponse.order.encryptedDestination.ciphertext}
                </code>
              </div>

              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    IV (12 Byte CSPRNG):
                  </span>
                  <code
                    style={{
                      display: "block",
                      background: "#f1f5f9",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      wordBreak: "break-all",
                      marginTop: "2px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {orderResponse.order.encryptedDestination.iv}
                  </code>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    Auth Tag (16 Byte GCM):
                  </span>
                  <code
                    style={{
                      display: "block",
                      background: "#f1f5f9",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      wordBreak: "break-all",
                      marginTop: "2px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {orderResponse.order.encryptedDestination.authTag}
                  </code>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  borderTop: "1px dashed #cbd5e1",
                  paddingTop: "0.75rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleVerifyDecryption}
                  disabled={isDecrypting}
                  style={{
                    background: "#285a49",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {isDecrypting
                    ? "Memverifikasi..."
                    : "🔓 Uji Verifikasi & Dekripsi Server"}
                </button>

                {decryptedAddress && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "8px",
                      background: "#f0fdf4",
                      borderRadius: "6px",
                      border: "1px solid #86efac",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#166534" }}>
                      Hasil Dekripsi Terverifikasi:
                    </span>{" "}
                    <span style={{ color: "#1e293b" }}>{decryptedAddress}</span>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.75rem",
                        color: "#15803d",
                      }}
                    >
                      ✓ Integritas dan keaslian data terverifikasi oleh
                      authentication tag AES-256-GCM.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
