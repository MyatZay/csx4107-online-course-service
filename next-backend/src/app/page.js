export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
          CSX4107 Project
        </p>
        <h1 className="text-3xl font-bold">Online Course Service API</h1>
        <p className="mt-4 leading-7 text-slate-300">
          The backend service is running. The React application uses the API routes below.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <code className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-200">POST /api/auth/login</code>
          <code className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-200">GET /api/course</code>
          <code className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-200">GET /api/my-courses</code>
          <code className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-200">GET /api/auth/me</code>
        </div>
      </section>
    </main>
  );
}
