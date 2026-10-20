import { getClientPromise } from "@/lib/mongodb";
import { objectId, requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function GET(req) {
  const current = requireUser(req);
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "student") return errorResponse("Students only.", 403);
  const client = await getClientPromise();
  const courses = await client.db().collection("courses").find({ enrolledStudentIds: objectId(current.userId), status: { $ne: "Cancel" } }).toArray();
  return successResponse({ courses: courses.map((course) => ({ ...course, _id: course._id.toString(), teacherId: course.teacherId.toString(), enrolledStudentIds: course.enrolledStudentIds.map(String) })) }, 200);
}
