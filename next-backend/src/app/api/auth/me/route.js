import { requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(req) {
  const user = requireUser(req);
  return user ? successResponse({ user: { id: user.userId, username: user.username, email: user.email, role: user.role } }, 200) : errorResponse("Authentication required.", 401);
}
