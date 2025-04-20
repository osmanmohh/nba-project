export function getLogo(tm) {
  if (!tm || typeof tm !== "string") return null;
  const cleanTm = tm.toUpperCase() === "NOP" ? "NO" : tm.toUpperCase();


const currentTeams = [
  "ATL", "BKN", "BOS", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "NO", "NYK", "OKC", "ORL", "PHI", "PHX", "POR", "SAC", "SAS", "TOR", "UTH", "WAS"
]

if (currentTeams.includes(cleanTm.toUpperCase())){
  return `https://a.espncdn.com/i/teamlogos/nba/500/${cleanTm}.png`;
}


  return null;
}
