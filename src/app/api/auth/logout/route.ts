import { cookies } from "next/headers";
import { apiFailure, apiSuccess } from "@/server/api-error";
import { AUTH_COOKIE } from "@/server/auth";

export async function POST() {
  try {
    (await cookies()).set({
      name: AUTH_COOKIE,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return apiSuccess({ message: "Signed out." });
  } catch (error) {
    return apiFailure(error);
  }
}
