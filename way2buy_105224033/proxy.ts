import { NextResponse, type NextRequest } from "next/server";
import { products } from "./lib/catalog/products";

export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/produk\/([^/]+)$/);

  if (!match) {
    return NextResponse.next();
  }

  const id = match[1];
  const isValidId =
    /^P\d{3}$/.test(id) && products.some((product) => product.id === id);

  if (!isValidId) {
    return new NextResponse(
      `<!doctype html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Produk tidak ditemukan | Way2Buy</title>
        </head>
        <body>
          <main>
            <p>404 · Produk tidak ditemukan</p>
            <h1>Produk ini belum ada di katalog.</h1>
            <p>Periksa kembali ID produk atau jelajahi katalog yang tersedia.</p>
            <a href="/produk">Kembali ke katalog</a>
          </main>
        </body>
      </html>`,
      {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }

  return NextResponse.next();
}
