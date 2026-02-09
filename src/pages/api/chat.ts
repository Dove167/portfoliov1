import type { APIRoute } from "astro";
// @ts-ignore - Vite raw import
import summaryOfMe from "../../../summary_of_me.md?raw";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ content: "Please provide a message." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const env = (locals as any).runtime.env;
    const apiKey: string | undefined = env.OPENROUTER_API_KEY;
    const model: string =
      env.OPENROUTER_MODEL ||
      "google/gemini-2.0-flash-lite-preview-02-05:free";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ content: "AI service is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `You are an AI assistant for Josh Fajardo's portfolio website. You have access to the following information about Josh:\n\n${summaryOfMe}\n\nUse this information to answer questions about Josh. Be helpful, friendly, and concise. If asked about something not covered in the information provided, politely let them know you can only speak to what you know about Josh.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://joshfajardo.dev",
          "X-Title": "Josh Fajardo Portfolio",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", response.status, data);
      return new Response(
        JSON.stringify({
          content: "Sorry, the AI service returned an error. Please try again later.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const content =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that.";

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        content: "Error communicating with AI service.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
