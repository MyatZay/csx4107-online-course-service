import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI before running npm run seed.");
const client = new MongoClient(uri);
const passwordHash = await bcrypt.hash("CourseDemo123!", 10);
const testUsers = [
  ["teacher.ada", "ada.teacher@example.com", "teacher"],
  ["teacher.lin", "lin.teacher@example.com", "teacher"],
  ["teacher.sami", "sami.teacher@example.com", "teacher"],
  ["student.mia", "mia.student@example.com", "student"],
  ["student.noah", "noah.student@example.com", "student"],
  ["student.zara", "zara.student@example.com", "student"],
].map(([username, email, role]) => ({ username, email, role, passwordHash }));

try {
  await client.connect();
  const users = client.db().collection("users");
  for (const user of testUsers) {
    await users.updateOne({ email: user.email }, { $setOnInsert: { ...user, createdAt: new Date() } }, { upsert: true });
  }
  console.log("Seeded 3 teachers and 3 students. Password for all accounts: CourseDemo123!");
} finally { await client.close(); }
