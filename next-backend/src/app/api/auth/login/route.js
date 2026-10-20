import bcrypt from "bcrypt";
import { getClientPromise } from "@/lib/mongodb";
import { signUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(req) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) return errorResponse("Username/email and password are required.", 400);
    const client = await getClientPromise();
    const user = await client.db().collection("users").findOne({
      $or: [{ username: identifier.trim() }, { email: identifier.trim().toLowerCase() }],
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return errorResponse("Invalid username/email or password.", 401);
    }
    const response = successResponse({ user: { id: user._id.toString(), username: user.username, email: user.email, role: user.role } }, 200);
    const production = process.env.NODE_ENV === "production";
    response.cookies.set("token", signUser(user), {
      httpOnly: true, secure: production, sameSite: production ? "none" : "lax", path: "/", maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return errorResponse("Unable to sign in.", 500);
  }
}
