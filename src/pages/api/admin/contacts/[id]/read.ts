import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;
    const id = params.id;

    await db
      .prepare("UPDATE contacts SET read = 1 WHERE id = ?")
      .bind(id)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: "Contact marked as read." }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Mark read error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to mark contact as read.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
