export interface PrismaDatabaseError {
  code: "P1000" | "P1001" | "P1003" | "P2021" | "P2022";
  message: string;
}

const DATABASE_ERROR_MESSAGES: Record<PrismaDatabaseError["code"], string> = {
  P1000:
    "PostgreSQL menolak kredensial DATABASE_URL. Periksa host, nama pengguna, password, dan nama database di file .env.",
  P1001:
    "PostgreSQL tidak dapat dijangkau. Pastikan layanan PostgreSQL berjalan dan host serta port di DATABASE_URL benar.",
  P1003:
    "Database yang tercantum di DATABASE_URL tidak ditemukan. Buat database tersebut atau perbaiki nama databasenya.",
  P2021:
    "Tabel aplikasi belum tersedia. Terapkan migrasi Prisma dengan npx prisma migrate dev.",
  P2022:
    "Struktur tabel tidak sesuai dengan skema Prisma. Terapkan migrasi terbaru dengan npx prisma migrate dev.",
};

export function getPrismaDatabaseError(
  error: unknown,
): PrismaDatabaseError | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const code =
    "code" in error && typeof error.code === "string"
      ? error.code
      : "errorCode" in error && typeof error.errorCode === "string"
        ? error.errorCode
        : null;

  if (
    code !== "P1000" &&
    code !== "P1001" &&
    code !== "P1003" &&
    code !== "P2021" &&
    code !== "P2022"
  ) {
    return null;
  }

  return { code, message: DATABASE_ERROR_MESSAGES[code] };
}
