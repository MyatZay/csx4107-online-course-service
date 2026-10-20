import { getClientPromise } from "@/lib/mongodb";
import { isValidId, objectId, requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

const statuses = ["Open", "Close", "Cancel"];
const normalize = (course) => ({ ...course, _id: course._id.toString(), teacherId: course.teacherId.toString(), enrolledStudentIds: course.enrolledStudentIds.map(String) });
async function findCourse(courseId) {
  const client = await getClientPromise();
  return { db: client.db(), course: await client.db().collection("courses").findOne({ _id: objectId(courseId) }) };
}
function owns(course, current) { return course.teacherId.toString() === current.userId; }

export async function GET(req, { params }) {
  const current = requireUser(req); const { course_id } = await params;
  if (!current) return errorResponse("Authentication required.", 401);
  if (!isValidId(course_id)) return errorResponse("Invalid course id.", 400);
  const { db, course } = await findCourse(course_id);
  if (!course) return errorResponse("Course not found.", 404);
  if (current.role === "student" && course.status === "Cancel") return errorResponse("Course not found.", 404);
  const result = normalize(course);
  if (current.role === "teacher" && owns(course, current)) {
    const ids = course.enrolledStudentIds || [];
    const students = ids.length ? await db.collection("users").find({ _id: { $in: ids } }, { projection: { passwordHash: 0 } }).toArray() : [];
    result.enrolledStudents = students.map((student) => ({ ...student, _id: student._id.toString() }));
  }
  return successResponse({ course: result }, 200);
}

export async function PUT(req, { params }) {
  const current = requireUser(req); const { course_id } = await params;
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "teacher") return errorResponse("Only teachers can update courses.", 403);
  if (!isValidId(course_id)) return errorResponse("Invalid course id.", 400);
  const { db, course } = await findCourse(course_id);
  if (!course) return errorResponse("Course not found.", 404);
  if (!owns(course, current)) return errorResponse("You can only update your own courses.", 403);
  const data = await req.json();
  const update = {};
  for (const key of ["name", "durationDays", "topics", "price", "maxStudents", "status"]) if (data[key] !== undefined) update[key] = data[key];
  if (update.name !== undefined && !String(update.name).trim()) return errorResponse("Course name is required.", 400);
  if (update.durationDays !== undefined && (!Number.isInteger(Number(update.durationDays)) || Number(update.durationDays) < 1)) return errorResponse("Duration must be at least one day.", 400);
  if (update.price !== undefined && (Number.isNaN(Number(update.price)) || Number(update.price) < 0)) return errorResponse("Price must be zero or more.", 400);
  if (update.maxStudents !== undefined && (!Number.isInteger(Number(update.maxStudents)) || Number(update.maxStudents) < course.enrolledStudentIds.length)) return errorResponse("Max students cannot be less than current enrolment.", 400);
  if (update.status !== undefined && !statuses.includes(update.status)) return errorResponse("Invalid course status.", 400);
  if (update.topics !== undefined && (!Array.isArray(update.topics) || !update.topics.map(String).some((x) => x.trim()))) return errorResponse("At least one topic is required.", 400);
  if (update.name !== undefined) update.name = update.name.trim();
  if (update.topics !== undefined) update.topics = update.topics.map(String).map((x) => x.trim()).filter(Boolean);
  for (const key of ["durationDays", "price", "maxStudents"]) if (update[key] !== undefined) update[key] = Number(update[key]);
  update.updatedAt = new Date();
  await db.collection("courses").updateOne({ _id: course._id }, { $set: update });
  return successResponse({ course: normalize({ ...course, ...update }) }, 200);
}

export async function DELETE(req, { params }) {
  const current = requireUser(req); const { course_id } = await params;
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "teacher") return errorResponse("Only teachers can delete courses.", 403);
  if (!isValidId(course_id)) return errorResponse("Invalid course id.", 400);
  const { db, course } = await findCourse(course_id);
  if (!course) return errorResponse("Course not found.", 404);
  if (!owns(course, current)) return errorResponse("You can only delete your own courses.", 403);
  if (course.enrolledStudentIds.length) return errorResponse("A course with enrolled students cannot be deleted.", 409);
  await db.collection("courses").deleteOne({ _id: course._id });
  return successResponse({ message: "Course deleted." }, 200);
}
