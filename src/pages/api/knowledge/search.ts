import type { APIRoute } from "astro";
// @ts-ignore - Vite raw import
import summaryOfMe from "../../../../summary_of_me.md?raw";

export const prerender = false;

interface KnowledgeSection {
  title: string;
  content: string;
}

function parseKnowledgeFile(text: string): KnowledgeSection[] {
  const lines = text.split("\n");
  const sections: KnowledgeSection[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = line.replace("## ", "").trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q")?.toLowerCase() || "";

  if (!query) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sections = parseKnowledgeFile(summaryOfMe);

  const results = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(query) ||
      section.content.toLowerCase().includes(query),
  );

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
