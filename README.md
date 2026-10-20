# Online Course Service

## Student Information

- **Student Name:** Myat Zay Hein
- **Student ID:** 6712130

## Test Credentials

All seeded users use the password `CourseDemo123!`.

| Role | Username | Email |
| --- | --- | --- |
| Teacher | `teacher.ada` | `ada.teacher@example.com` |
| Teacher | `teacher.lin` | `lin.teacher@example.com` |
| Teacher | `teacher.sami` | `sami.teacher@example.com` |
| Student | `student.mia` | `mia.student@example.com` |
| Student | `student.noah` | `noah.student@example.com` |
| Student | `student.zara` | `zara.student@example.com` |

## Prerequisites

- Node.js 20 or newer
- A running MongoDB instance (local MongoDB or MongoDB Atlas)

## How to Run & Test

### 1. Backend Setup (`next-backend/`)

```bash
cd next-backend
cp .env.example .env.local
# Edit .env.local and set MONGODB_URI and JWT_SECRET.
npm install
npm run seed
npm run dev
```

The backend runs at `http://localhost:3000`.

### 2. Frontend Setup (`react-frontend/`)

In a second terminal:

```bash
cd react-frontend
cp .env.example .env
npm install
npm run dev
```

Open the displayed Vite URL, normally `http://localhost:5173`.

### 3. Testing Walkthrough

1. Log in as a teacher. Create a course, open its details, update it, and confirm that the teacher can see the enrolled-student list.
2. Log in as a student. Search the catalogue, enrol in an **Open** course, and confirm it appears in **My courses**.
3. Change a course to **Close** as the teacher: it remains visible to students but cannot be enrolled in. Change it to **Cancel**: it disappears from the student catalogue.
4. Verify a teacher cannot edit or delete another teacher's course, a student cannot create a course, a student cannot enrol twice, and a course with enrolled students cannot be deleted. These restrictions are enforced by the API as well as the interface.

## Deployment

Deploy `next-backend` and `react-frontend` separately (for example, on Vercel). Set `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` in the backend deployment. Set `VITE_API_URL` to the deployed backend URL in the frontend deployment, then set `FRONTEND_URL` to the deployed frontend URL. Use HTTPS in production so the session cookie can be secure.
