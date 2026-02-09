import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const db = (locals as any).runtime.env.DB;

    await db
      .prepare(
        "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
      )
      .bind(name, email, subject, message)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Contact error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to save your message. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
