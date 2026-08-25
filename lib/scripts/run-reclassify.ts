/**
 * Point d'entree CLI de reclassifyAll(). Voir README ("Rejouer le
 * classement") pour la commande de lancement.
 */
import fs from "fs";
for (const l of fs.readFileSync(".env.local", "utf8").split("\n").filter(l => l.includes("="))) {
  const i = l.indexOf("=");
  process.env[l.slice(0, i)] = l.slice(i + 1).replace(/^["']|["']$/g, "");
}
(async () => {
  const { reclassifyAll } = await import("./reclassify");
  console.log(JSON.stringify(await reclassifyAll(), null, 2));
})();
