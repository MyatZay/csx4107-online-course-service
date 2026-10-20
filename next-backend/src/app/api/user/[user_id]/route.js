import { getClientPromise } from "@/lib/mongodb";
import { isValidId, objectId, requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(req, { params }) {
  const current = requireUser(req);
  const { user_id } = await params;
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "teacher" && current.userId !== user_id) return errorResponse("Not allowed.", 403);
  if (!isValidId(user_id)) return errorResponse("Invalid user id.", 400);
  const client = await getClientPromise();
  const user = await client.db().collection("users").findOne({ _id: objectId(user_id) }, { projection: { passwordHash: 0 } });
  return user ? successResponse({ user: { ...user, _id: user._id.toString() } }, 200) : errorResponse("User not found.", 404);
}
