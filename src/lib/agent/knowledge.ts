import { knowledgeArticles, type KnowledgeArticle } from "@/content/knowledge/articles";

function normalize(value: string) {
  return value.toLowerCase().replace(/['’]/g, "'");
}

export function retrieveKnowledge(query: string, limit = 4): KnowledgeArticle[] {
  const q = normalize(query);
  const scored = knowledgeArticles
    .map((article) => {
      let score = 0;
      if (normalize(article.title).includes(q)) {
        score += 4;
      }

      for (const tag of article.tags) {
        if (q.includes(normalize(tag)) || normalize(tag).includes(q)) {
          score += 3;
        }
      }

      const words = q.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 3);
      for (const word of words) {
        if (normalize(article.body).includes(word)) {
          score += 1;
        }
      }

      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);

  if (scored.length > 0) {
    return scored;
  }

  return knowledgeArticles.filter((article) =>
    ["company", "process", "faq"].includes(article.id),
  );
}

export function formatKnowledgeBlock(articles: KnowledgeArticle[]) {
  return articles
    .map((article) => `### ${article.title}\n${article.body}`)
    .join("\n\n");
}
