import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;

    const { results } = await db
      .prepare(
        "SELECT id, name, email, subject, message, created_at, read FROM contacts ORDER BY created_at DESC",
      )
      .all();

    const contacts = results.map((row: any) => ({
      ...row,
      read: row.read === 1,
    }));

    return new Response(JSON.stringify({ contacts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("List contacts error:", error);
    return new Response(
      JSON.stringify({ contacts: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
