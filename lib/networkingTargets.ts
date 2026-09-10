/**
 * Liste de cibles pour le networking (calls de 10 minutes, pas des offres
 * d'emploi) — sert de référentiel dans la page /networking pour savoir quoi
 * chercher sur LinkedIn. Contrairement à COMPANIES (lib/companies.ts), ce
 * fichier ne contient aucune personne réelle : trouver et vérifier les
 * contacts individuels doit se faire depuis le compte LinkedIn de
 * l'utilisateur, jamais généré ici.
 */

export type NetworkingCity = "new_york" | "paris" | "other";
export type NetworkingDivision =
  | "global_markets"
  | "asset_management"
  | "portfolio_management"
  | "wealth_management"
  | "hedge_fund_quant"
  | "private_equity";

export interface NetworkingTarget {
  firmName: string;
  division: NetworkingDivision;
  city: NetworkingCity;
  note?: string;
}

export const DIVISION_LABELS: Record<NetworkingDivision, string> = {
  global_markets: "Global Markets / Sales & Trading",
  asset_management: "Asset Management",
  portfolio_management: "Portfolio Management",
  wealth_management: "Wealth / Private Banking",
  hedge_fund_quant: "Hedge Fund / Quant",
  private_equity: "Private Equity / Alternatives",
};

export const NETWORKING_TARGETS: NetworkingTarget[] = [
  // ---- NEW YORK — banques bulge bracket, Global Markets ----
  { firmName: "Goldman Sachs", division: "global_markets", city: "new_york" },
  { firmName: "J.P. Morgan", division: "global_markets", city: "new_york" },
  { firmName: "Morgan Stanley", division: "global_markets", city: "new_york" },
  { firmName: "Citi", division: "global_markets", city: "new_york" },
  { firmName: "Bank of America", division: "global_markets", city: "new_york" },
  { firmName: "Barclays", division: "global_markets", city: "new_york", note: "Bureau US, pas Londres" },
  { firmName: "Deutsche Bank", division: "global_markets", city: "new_york", note: "Bureau US" },
  { firmName: "UBS", division: "global_markets", city: "new_york", note: "Investment Bank US" },
  { firmName: "Wells Fargo", division: "global_markets", city: "new_york" },
  { firmName: "Jefferies", division: "global_markets", city: "new_york" },

  // ---- NEW YORK — Asset Management / Portfolio Management ----
  { firmName: "BlackRock", division: "portfolio_management", city: "new_york" },
  { firmName: "PIMCO", division: "portfolio_management", city: "new_york", note: "Siège Newport Beach, bureau NY actif" },
  { firmName: "Capital Group", division: "portfolio_management", city: "new_york" },
  { firmName: "Neuberger Berman", division: "portfolio_management", city: "new_york" },
  { firmName: "AllianceBernstein", division: "portfolio_management", city: "new_york" },
  { firmName: "Invesco", division: "asset_management", city: "new_york" },
  { firmName: "BNY Mellon Investment Management", division: "asset_management", city: "new_york" },
  { firmName: "T. Rowe Price", division: "portfolio_management", city: "new_york", note: "Siège Baltimore, bureau NY" },

  // ---- NEW YORK — Hedge Funds / Quant ----
  { firmName: "Citadel", division: "hedge_fund_quant", city: "new_york" },
  { firmName: "Point72", division: "hedge_fund_quant", city: "new_york" },
  { firmName: "Millennium Management", division: "hedge_fund_quant", city: "new_york" },
  { firmName: "D.E. Shaw", division: "hedge_fund_quant", city: "new_york" },
  { firmName: "Two Sigma", division: "hedge_fund_quant", city: "new_york" },
  { firmName: "Balyasny (BAM)", division: "hedge_fund_quant", city: "new_york" },

  // ---- NEW YORK — Alternatives / Private Equity ----
  { firmName: "Blackstone", division: "private_equity", city: "new_york" },
  { firmName: "Apollo Global Management", division: "private_equity", city: "new_york" },
  { firmName: "KKR", division: "private_equity", city: "new_york" },
  { firmName: "Ares Management", division: "private_equity", city: "new_york", note: "Siège LA, gros bureau NY" },
  { firmName: "Carlyle", division: "private_equity", city: "new_york", note: "Siège DC, bureau NY" },

  // ---- NEW YORK — Wealth / Private Banking ----
  { firmName: "Goldman Sachs Private Wealth Management", division: "wealth_management", city: "new_york" },
  { firmName: "Morgan Stanley Private Wealth Management", division: "wealth_management", city: "new_york" },
  { firmName: "J.P. Morgan Private Bank", division: "wealth_management", city: "new_york" },
  { firmName: "UBS Wealth Management Americas", division: "wealth_management", city: "new_york" },
  { firmName: "Bank of America Private Bank (Merrill)", division: "wealth_management", city: "new_york" },
  { firmName: "BNY Mellon Wealth Management", division: "wealth_management", city: "new_york" },
  { firmName: "Northern Trust Wealth Management", division: "wealth_management", city: "new_york" },
  { firmName: "Rockefeller Capital Management", division: "wealth_management", city: "new_york", note: "Boutique pure wealth, très ciblable" },
  { firmName: "Brown Brothers Harriman", division: "wealth_management", city: "new_york" },

  // ---- NEW YORK — Boutiques M&A / Advisory (bonus, hors marchés stricts) ----
  { firmName: "Evercore", division: "global_markets", city: "new_york" },
  { firmName: "Lazard", division: "asset_management", city: "new_york" },
  { firmName: "Moelis & Company", division: "global_markets", city: "new_york" },
  { firmName: "Centerview Partners", division: "global_markets", city: "new_york" },
  { firmName: "PJT Partners", division: "global_markets", city: "new_york" },

  // ---- PARIS — banques et gestion d'actifs ----
  { firmName: "BNP Paribas", division: "global_markets", city: "paris", note: "CIB Global Markets" },
  { firmName: "Société Générale", division: "global_markets", city: "paris" },
  { firmName: "Natixis CIB", division: "global_markets", city: "paris" },
  { firmName: "Crédit Agricole CIB", division: "global_markets", city: "paris" },
  { firmName: "Amundi", division: "asset_management", city: "paris" },
  { firmName: "Rothschild & Co", division: "wealth_management", city: "paris" },
  { firmName: "AXA Investment Managers", division: "asset_management", city: "paris" },
  { firmName: "Edmond de Rothschild", division: "wealth_management", city: "paris" },
  { firmName: "Tikehau Capital", division: "private_equity", city: "paris" },
  { firmName: "Ardian", division: "private_equity", city: "paris" },
  { firmName: "Eurazeo", division: "private_equity", city: "paris" },

  // ---- Autres places (Londres, Genève, Zurich) — pour le reste du quota ----
  { firmName: "UBS Global Wealth Management", division: "wealth_management", city: "other", note: "Zurich/Genève" },
  { firmName: "Pictet", division: "wealth_management", city: "other", note: "Genève, private banking pur" },
  { firmName: "Lombard Odier", division: "wealth_management", city: "other", note: "Genève" },
  { firmName: "Man Group", division: "hedge_fund_quant", city: "other", note: "Londres" },
  { firmName: "Marshall Wace", division: "hedge_fund_quant", city: "other", note: "Londres" },
  { firmName: "Schroders", division: "asset_management", city: "other", note: "Londres" },
];
