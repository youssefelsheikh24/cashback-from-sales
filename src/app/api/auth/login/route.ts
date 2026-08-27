import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 422 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    // Uniform compare regardless of whether the user exists, to avoid leaking
    // which emails are registered / timing differences.
    const hash =
      admin?.passwordHash ||
      "pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    const valid = await verifyPassword(parsed.data.password, hash);

    if (!admin || !valid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createSession({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    return NextResponse.json({
      success: true,
      user: { email: admin.email, name: admin.name, role: admin.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
