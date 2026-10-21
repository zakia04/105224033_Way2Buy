export type ProductCategory = "Makanan" | "Fashion" | "Minuman" | "Oleh-oleh";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  origin: string;
  price: number;
  rating: number;
  illustration: string;
  description: string;
}

export const categories = [
  "Semua",
  "Makanan",
  "Fashion",
  "Minuman",
  "Oleh-oleh",
] as const;

export const products: Product[] = [
  {
    id: "P001",
    name: "Keripik Sanjai Balado",
    category: "Makanan",
    origin: "Bukittinggi, Sumatera Barat",
    price: 35000,
    rating: 4.9,
    illustration: "🥔",
    description:
      "Keripik singkong renyah dengan bumbu balado khas Minang yang kaya rasa.",
  },
  {
    id: "P002",
    name: "Bakpia Pathok 25",
    category: "Oleh-oleh",
    origin: "Yogyakarta",
    price: 45000,
    rating: 4.8,
    illustration: "🥮",
    description:
      "Bakpia lembut dengan isian kacang hijau yang dibuat segar setiap hari.",
  },
  {
    id: "P003",
    name: "Kopi Arabika Gayo",
    category: "Minuman",
    origin: "Takengon, Aceh",
    price: 85000,
    rating: 4.9,
    illustration: "☕",
    description:
      "Kopi pegunungan dengan aroma floral dan rasa yang bersih serta seimbang.",
  },
  {
    id: "P004",
    name: "Batik Tulis Motif Parang",
    category: "Fashion",
    origin: "Yogyakarta",
    price: 275000,
    rating: 4.7,
    illustration: "🧵",
    description:
      "Kain batik bermotif klasik yang dikerjakan perajin lokal dengan teliti.",
  },
  {
    id: "P005",
    name: "Pempek Kapal Selam",
    category: "Makanan",
    origin: "Palembang, Sumatera Selatan",
    price: 60000,
    rating: 4.8,
    illustration: "🍲",
    description:
      "Pempek ikan dengan cuko khas Palembang, dikemas dingin untuk perjalanan.",
  },
  {
    id: "P006",
    name: "Kaos Lokal Braga",
    category: "Fashion",
    origin: "Bandung, Jawa Barat",
    price: 110000,
    rating: 4.6,
    illustration: "👕",
    description:
      "Kaos berbahan katun nyaman dengan ilustrasi yang terinspirasi sudut Bandung.",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
