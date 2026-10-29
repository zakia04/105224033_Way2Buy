import { z } from "zod";
import { products } from "@/lib/catalog/products";

export const orderSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal terdiri dari 2 karakter."),
    email: z
      .string()
      .trim()
      .email("Masukkan alamat email yang valid, misalnya nama@email.com."),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]+$/, "Masukkan nomor WhatsApp yang valid.")
      .refine(
        (value) => {
          const digits = value.replace(/\D/g, "");
          return digits.length >= 9 && digits.length <= 16;
        },
        "Masukkan nomor WhatsApp yang valid (9–16 digit).",
      ),
    product: z
      .string()
      .min(1, "Pilih produk yang ingin dititipkan.")
      .refine(
        (value) =>
          value === "custom" || products.some((product) => product.id === value),
        "Produk yang dipilih tidak tersedia.",
      ),
    quantity: z
      .string()
      .regex(/^\d+$/, "Jumlah harus berupa bilangan bulat.")
      .refine(
        (value) => Number.isSafeInteger(Number(value)) && Number(value) >= 1,
        "Jumlah minimal 1.",
      ),
    destination: z
      .string()
      .trim()
      .min(3, "Masukkan kota tujuan pengiriman."),
    notes: z.string(),
  })
  .superRefine((values, context) => {
    if (values.product === "custom" && values.notes.trim().length < 4) {
      context.addIssue({
        code: "custom",
        message:
          "Jelaskan produk yang ingin dititipkan (minimal 4 karakter).",
        path: ["notes"],
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;
