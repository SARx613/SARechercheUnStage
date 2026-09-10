/**
 * Templates de messages pour l'approche networking (InMail LinkedIn +
 * email), affichés dans la page /networking avec bouton "copier". Les
 * champs entre crochets sont à personnaliser à la main avant l'envoi — un
 * message copié-collé sans personnalisation ne marche pas pour ce type
 * d'approche.
 */

export interface OutreachTemplate {
  id: string;
  label: string;
  channel: "linkedin_inmail" | "email";
  lang: "fr" | "en";
  subject?: string;
  body: string;
}

export const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "inmail-en-generic",
    label: "InMail LinkedIn — générique (EN)",
    channel: "linkedin_inmail",
    lang: "en",
    body: `Hi [First name],

I'm a [year]-year [degree] student at [school], graduating [month year], and I'm exploring [division, e.g. "global markets"] roles for a [Jan–Jun 2027] internship.

I came across your profile and was struck by [specific detail — a deal, a strategy, a post they wrote, their career path]. I'd love to hear how you got into [their role/desk] and what the day-to-day actually looks like — would you have 10 minutes for a quick call in the next couple of weeks?

Happy to work around your schedule.

Best,
[Your name]`,
  },
  {
    id: "inmail-en-short",
    label: "InMail LinkedIn — version courte (EN)",
    channel: "linkedin_inmail",
    lang: "en",
    body: `Hi [First name] — [degree] student at [school] here, looking to learn more about [desk/team]. Your background in [specific detail] caught my eye. Would you be open to a quick 10-min call sometime in the next two weeks? Totally understand if not — thanks either way!

[Your name]`,
  },
  {
    id: "email-en-generic",
    label: "Email direct — générique (EN)",
    channel: "email",
    lang: "en",
    subject: "Quick question about [desk/team] — 10 min?",
    body: `Hi [First name],

My name is [Your name], a [year]-year [degree] student at [school]. I'm reaching out because I'm very interested in [division, e.g. "portfolio management"] and your background in [specific detail] stood out to me.

Would you have 10 minutes in the next couple of weeks for a short call? I'd like to understand better what your role involves day to day and how you got there — I'm not asking for anything beyond your time and perspective.

Thank you for considering, and no worries at all if you're too busy right now.

Best regards,
[Your name]
[phone / LinkedIn link]`,
  },
  {
    id: "inmail-fr-generic",
    label: "InMail LinkedIn — générique (FR, pour Paris)",
    channel: "linkedin_inmail",
    lang: "fr",
    body: `Bonjour [Prénom],

Je suis étudiant en [formation] à [école], et je recherche un stage sur [janvier-juin 2027] dans [division, ex. "les marchés financiers"].

Votre parcours chez [entreprise], notamment [détail précis — une transaction, un poste, un article], m'a beaucoup intéressé. Auriez-vous 10 minutes dans les deux prochaines semaines pour un rapide échange téléphonique ? J'aimerais mieux comprendre votre métier au quotidien.

Je m'adapte bien sûr à vos disponibilités.

Bien cordialement,
[Votre nom]`,
  },
  {
    id: "email-fr-generic",
    label: "Email direct — générique (FR)",
    channel: "email",
    lang: "fr",
    subject: "Question rapide sur [poste/équipe] — 10 min ?",
    body: `Bonjour [Prénom],

Je m'appelle [Votre nom], étudiant en [formation] à [école]. Je vous contacte car votre parcours en [division/détail précis] m'intéresse beaucoup dans le cadre de ma recherche de stage (janvier-juin 2027).

Auriez-vous 10 minutes dans les prochaines semaines pour un bref appel ? Je souhaiterais mieux comprendre votre métier et votre trajectoire.

Je comprendrai tout à fait si votre emploi du temps ne le permet pas.

Bien cordialement,
[Votre nom]
[téléphone / lien LinkedIn]`,
  },
];
