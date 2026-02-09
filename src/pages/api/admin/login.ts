import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { username, password } = await request.json();

    const env = (locals as any).runtime.env;
    const adminUsername: string | undefined = env.ADMIN_USERNAME;
    const adminPassword: string | undefined = env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Admin credentials not configured.",
          token: null,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (username === adminUsername && password === adminPassword) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Login successful",
          token: "admin-token-12345",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid username or password",
        token: null,
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Login failed.",
        token: null,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
