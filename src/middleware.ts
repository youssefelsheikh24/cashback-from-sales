import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "cashback-sales-fallback-dev-secret-change-me"
);
const COOKIE_NAME = "cashback_sales_session";

/**
 * Edge middleware — first line of defence for the Sales area.
 *
 * Anyone hitting /sales (except /sales/login) without a valid session cookie is
 * redirected to the login page. API routes additionally re-check auth on the
 * server, so this is defence-in-depth, not the only gate.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/sales/login";
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  if (!isValid && pathname.startsWith("/sales") && !isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/sales/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isValid && isLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/sales";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sales/:path*"],
};
