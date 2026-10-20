import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

export function verifyJWT(req) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function requireUser(req) {
  const user = verifyJWT(req);
  if (!user || !user.userId || !["student", "teacher"].includes(user.role)) {
    return null;
  }
  return user;
}

export function isValidId(id) {
  return ObjectId.isValid(id);
}

export function objectId(id) {
  return new ObjectId(id);
}

export function signUser(user) {
  return jwt.sign(
    { userId: user._id.toString(), username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
}
