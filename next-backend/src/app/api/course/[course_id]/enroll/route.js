import { getClientPromise } from "@/lib/mongodb";
import { isValidId, objectId, requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

export async function POST(req, { params }) {
  const current = requireUser(req); const { course_id } = await params;
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "student") return errorResponse("Only students can enrol.", 403);
  if (!isValidId(course_id)) return errorResponse("Invalid course id.", 400);
  const client = await getClientPromise(); const db = client.db(); const id = objectId(course_id);
  const course = await db.collection("courses").findOne({ _id: id });
  if (!course || course.status === "Cancel") return errorResponse("Course not found.", 404);
  if (course.status !== "Open") return errorResponse("Only open courses can be enrolled in.", 409);
  if (course.enrolledStudentIds.some((studentId) => studentId.toString() === current.userId)) return errorResponse("You are already enrolled in this course.", 409);
  if (course.enrolledStudentIds.length >= course.maxStudents) return errorResponse("This course is full.", 409);
  const result = await db.collection("courses").updateOne(
    { _id: id, status: "Open", enrolledStudentIds: { $ne: objectId(current.userId) }, $expr: { $lt: [{ $size: "$enrolledStudentIds" }, "$maxStudents"] } },
    { $push: { enrolledStudentIds: objectId(current.userId) }, $set: { updatedAt: new Date() } },
  );
  if (!result.modifiedCount) return errorResponse("The course is no longer available for enrolment.", 409);
  return successResponse({ message: "Enrolment successful." }, 201);
}
