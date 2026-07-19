import webpush from "web-push";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { pushSubscriptions } from "./db/schema";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    "mailto:simon5.amar@gmail.com",
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

interface MatchedJob {
  title: string;
  company: string;
  url: string;
}

export async function sendPushToAll(jobs: MatchedJob[]): Promise<void> {
  ensureConfigured();
  const subscriptions = await db.select().from(pushSubscriptions);
  if (subscriptions.length === 0) return;

  const body =
    jobs.length === 1
      ? `${jobs[0].company} — ${jobs[0].title}`
      : `${jobs.length} nouvelles offres correspondent a tes criteres`;

  const payload = JSON.stringify({
    title: "Nouvelle offre de stage",
    body,
    url: jobs.length === 1 ? jobs[0].url : "/",
  });

  await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        )
        .catch(async (err) => {
          // 410/404 = abonnement expire ou revoque cote navigateur -> on
          // le supprime pour ne pas re-tenter indefiniment chaque jour.
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          }
        })
    )
  );
}
