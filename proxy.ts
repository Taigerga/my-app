import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/** Optimistic check di edge. Pertahanan utama tetap di Server Component/Action via auth() + role. */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/worker") && role !== "ADMIN" && role !== "WORKER") {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/worker/:path*"],
};
