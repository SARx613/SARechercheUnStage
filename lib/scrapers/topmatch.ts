import type { TopmatchCompany } from "../companies";
import type { RawJob } from "./types";

interface TopmatchPosition {
  compPositionID: number;
  jobTitleText: string;
  extJobTitleText?: string | null;
  displayLocation?: string | null;
  fieldDesc?: string | null;
  activationDate?: string | null;
  receivedDate?: string | null;
  isActivePosition?: boolean;
}

interface TopmatchResponse {
  positions: TopmatchPosition[] | null;
  responseStatus: number;
  errorDescription: string | null;
}

/**
 * TopMatch (moteur "redmatch") est l'ATS de plusieurs maisons
 * d'investissement israeliennes. Son API candidat est publique mais non
 * documentee: un POST par tenant, identifie par l'affiliateGUID lisible en
 * clair dans careers.topmatch.co.il/<Tenant>/redmatch.settings.js.
 *
 * countryId=2 est Israel — c'est la valeur que le site lui-meme envoie.
 * Les filtres vides (KeyWords/CategoryId/cityId) renvoient tout le board:
 * on filtre cote job-tracker plutot que cote API, comme pour les autres ATS.
 */
export async function scrapeTopmatch(
  company: TopmatchCompany
): Promise<RawJob[]> {
  const res = await fetch(
    `https://careers.topmatch.co.il/CandidateAPI/api/position/Search/${company.affiliateGuid}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "job-tracker-personal-use",
      },
      body: JSON.stringify({
        KeyWords: "",
        CategoryId: [],
        countryId: 2,
        cityId: [],
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`TopMatch ${company.tenant}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as TopmatchResponse;
  // L'API repond 200 avec un responseStatus non nul en cas d'erreur metier.
  if (data.responseStatus !== 0) {
    throw new Error(
      `TopMatch ${company.tenant}: responseStatus ${data.responseStatus} ${data.errorDescription ?? ""}`.trim()
    );
  }

  return (data.positions ?? []).map((p) => {
    const postedRaw = p.activationDate ?? p.receivedDate;
    const postedAt = postedRaw ? new Date(postedRaw) : null;
    return {
      externalId: String(p.compPositionID),
      title: p.extJobTitleText || p.jobTitleText,
      location: p.displayLocation?.trim() || null,
      // Le mini-site construit ses liens d'offre ainsi (cf.
      // redmatch.candidate.components.js, returnPositionDetailsHref).
      url: `${company.careersUrl.replace(/\/$/, "")}/redmatch-apply/redmatch.apply.html?compPositionID=${p.compPositionID}`,
      postedAt: postedAt && !Number.isNaN(postedAt.getTime()) ? postedAt : null,
      // TopMatch n'a pas de champ "type de contrat": fieldDesc est le
      // domaine metier (ex: "כלכלה, כספים, השקעות ושוק ההון"), utile a
      // garder mais ce n'est pas un signal stage -> on retombe sur le titre.
      employmentType: null,
      raw: p as unknown as Record<string, unknown>,
    };
  });
}
