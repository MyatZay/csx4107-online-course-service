import { successResponse } from "@/lib/utils";

export async function POST() {
  const response = successResponse({ message: "Signed out." }, 200);
  const production = process.env.NODE_ENV === "production";
  response.cookies.set("token", "", { httpOnly: true, secure: production, path: "/", maxAge: 0, sameSite: production ? "none" : "lax" });
  return response;
}
