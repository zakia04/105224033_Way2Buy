import { z } from "zod";

export const productSchema = z.object({
  id: z.string().regex(/^P\d{3,}$/, "ID produk harus berformat P001."),
  name: z.string().trim().min(2, "Nama produk minimal 2 karakter."),
  category: z.enum(["Makanan", "Fashion", "Minuman", "Oleh-oleh"]),
  origin: z.string().trim().min(2, "Asal produk minimal 2 karakter."),
  price: z.number().int().positive("Harga harus bilangan bulat positif."),
  rating: z.number().min(0).max(5, "Rating harus antara 0 dan 5."),
  illustration: z.string().min(1, "Ilustrasi wajib diisi."),
  description: z.string().trim().min(4, "Deskripsi minimal 4 karakter."),
});

export type ProductInput = z.infer<typeof productSchema>;
