import { getClientPromise } from "@/lib/mongodb";
import { requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(req) {
  const current = requireUser(req);
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "teacher") return errorResponse("Teachers only.", 403);
  const client = await getClientPromise();
  const users = await client.db().collection("users").find({}, { projection: { passwordHash: 0 } }).toArray();
  return successResponse({ users: users.map((user) => ({ ...user, _id: user._id.toString() })) }, 200);
}
