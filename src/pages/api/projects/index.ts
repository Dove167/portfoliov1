import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;

    const { results } = await db
      .prepare(
        "SELECT id, title, description, technologies, github_url, demo_url, image_urls, featured, created_at, updated_at FROM projects ORDER BY created_at DESC",
      )
      .all();

    const projects = results.map((row: any) => ({
      ...row,
      featured: row.featured === 1,
    }));

    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("List projects error:", error);
    return new Response(
      JSON.stringify({ projects: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
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

    const db = (locals as any).runtime.env.DB;

    const result = await db
      .prepare(
        "INSERT INTO projects (title, description, technologies, github_url, demo_url, image_urls, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        title,
        description,
        technologies,
        github_url || null,
        demo_url || null,
        image_urls,
        featured ? 1 : 0,
      )
      .run();

    return new Response(
      JSON.stringify({
        id: result.meta.last_row_id,
        title,
        description,
        technologies,
        github_url: github_url || null,
        demo_url: demo_url || null,
        image_urls,
        featured: !!featured,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Create project error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create project." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
