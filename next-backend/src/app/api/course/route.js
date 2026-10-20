import { getClientPromise } from "@/lib/mongodb";
import { objectId, requireUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/utils";

const statuses = ["Open", "Close", "Cancel"];
function normalizeCourse(course) {
  return { ...course, _id: course._id.toString(), teacherId: course.teacherId.toString(), enrolledStudentIds: course.enrolledStudentIds.map(String) };
}
function validateCourse(data) {
  const required = ["name", "durationDays", "topics", "price", "maxStudents", "status"];
  if (required.some((key) => data[key] === undefined || data[key] === "")) return "All course fields are required.";
  if (!Array.isArray(data.topics) || data.topics.length === 0) return "At least one topic is required.";
  if (!Number.isInteger(Number(data.durationDays)) || Number(data.durationDays) < 1) return "Duration must be at least one day.";
  if (Number.isNaN(Number(data.price)) || Number(data.price) < 0) return "Price must be zero or more.";
  if (!Number.isInteger(Number(data.maxStudents)) || Number(data.maxStudents) < 1) return "Max students must be at least one.";
  if (!statuses.includes(data.status)) return "Invalid course status.";
  return null;
}

export async function GET(req) {
  const current = requireUser(req);
  if (!current) return errorResponse("Authentication required.", 401);
  const search = new URL(req.url).searchParams.get("search")?.trim();
  const client = await getClientPromise();
  const db = client.db();
  const match = current.role === "teacher" ? { teacherId: objectId(current.userId) } : { status: { $ne: "Cancel" } };
  if (search) match.$or = [{ name: { $regex: search, $options: "i" } }, { teacherName: { $regex: search, $options: "i" } }];
  const courses = await db.collection("courses").find(match).sort({ createdAt: -1 }).toArray();
  return successResponse({ courses: courses.map(normalizeCourse) }, 200);
}

export async function POST(req) {
  const current = requireUser(req);
  if (!current) return errorResponse("Authentication required.", 401);
  if (current.role !== "teacher") return errorResponse("Only teachers can create courses.", 403);
  try {
    const data = await req.json();
    const message = validateCourse(data);
    if (message) return errorResponse(message, 400);
    const course = {
      name: data.name.trim(), durationDays: Number(data.durationDays), topics: data.topics.map((topic) => topic.trim()).filter(Boolean), price: Number(data.price), maxStudents: Number(data.maxStudents), status: data.status,
      teacherId: objectId(current.userId), teacherName: current.username, enrolledStudentIds: [], createdAt: new Date(), updatedAt: new Date(),
    };
    const client = await getClientPromise();
    const result = await client.db().collection("courses").insertOne(course);
    return successResponse({ course: normalizeCourse({ ...course, _id: result.insertedId }) }, 201);
  } catch (error) {
    console.error("Create course failed", error);
    return errorResponse("Unable to create course.", 500);
  }
}

export async function OPTIONS() { return successResponse({}, 204); }
