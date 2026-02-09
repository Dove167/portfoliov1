import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;
    const id = params.id;

    const row = await db
      .prepare(
        "SELECT id, title, description, technologies, github_url, demo_url, image_urls, featured, created_at, updated_at FROM projects WHERE id = ?",
      )
      .bind(id)
      .first();

    if (!row) {
      return new Response(JSON.stringify({ error: "Project not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ...row, featured: row.featured === 1 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Get project error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get project." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;
    const id = params.id;

    const {
      title,
      description,
      technologies,
      github_url,
      demo_url,
      image_urls,
      featured,
    } = await request.json();

    if (!title || !description || !technologies || !image_urls) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await db
      .prepare(
        "UPDATE projects SET title = ?, description = ?, technologies = ?, github_url = ?, demo_url = ?, image_urls = ?, featured = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(
        title,
        description,
        technologies,
        github_url || null,
        demo_url || null,
        image_urls,
        featured ? 1 : 0,
        id,
      )
      .run();

    return new Response(
      JSON.stringify({
        id: Number(id),
        title,
        description,
        technologies,
        github_url: github_url || null,
        demo_url: demo_url || null,
        image_urls,
        featured: !!featured,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Update project error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update project." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;
    const id = params.id;

    await db.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Delete project error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete project." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
