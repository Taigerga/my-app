import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
  experimental: {
    // Default Next 1MB; form upload mengizinkan s.d. 2MB/file (maks 8 file
    // di produk) + overhead multipart. Kontrol utama tetap validasi 2MB/file.
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
