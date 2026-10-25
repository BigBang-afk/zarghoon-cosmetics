import { NextResponse } from "next/server";
import { auth } from "@/auth";

// First line of defence: anyone who isn't signed in is sent to the login page.
// Every admin page and action also checks the user again on the server
// (see lib/admin-auth.ts), including their role.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
