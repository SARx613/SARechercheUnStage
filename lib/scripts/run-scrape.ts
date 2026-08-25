/**
 * Point d'entree CLI pour declencher un scrape complet en local (hors
 * cron Vercel) — utile pour tester une nouvelle entreprise ou rejouer
 * apres une correction de scraper sans attendre le prochain passage
 * quotidien. Voir README ("Déclencher un scrape manuellement").
 */
import fs from "fs";
for (const line of fs
  .readFileSync(".env.local", "utf8")
  .split("\n")
  .filter((l) => l.includes("="))) {
  const i = line.indexOf("=");
  process.env[line.slice(0, i)] = line.slice(i + 1).replace(/^["']|["']$/g, "");
}

(async () => {
  const { runAllScrapers } = await import("../scrapers/run-all");
  const start = Date.now();
  const summary = await runAllScrapers();
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nDuree: ${Math.round((Date.now() - start) / 1000)}s`);
})();
