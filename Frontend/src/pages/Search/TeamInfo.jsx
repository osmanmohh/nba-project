import { useEffect, useState } from "react";
import Papa from "papaparse";
import "./TeamInfo.css";
import LeadersCard from "./LeadersCard";
import TeamRankingsCard from "./TeamRankingsCard";
import { teamColors } from "../../../public/teamColors";

export default function TeamInfo({ year, allTeams = [], games = {}, newRoster = [], newTeam = {} }) {
;
 
  const [newGames, setNewGames] = useState([]);
  

 

  const getTeamStrength = (team) => {
    if (!team) return 0;
    const nr = team.NRtg ?? (team.ORtg - team.DRtg);
    const score =
      nr * 0.5 +
      (team["FG%"] || 0) * 100 * 0.1 +
      (team["3P%"] || 0) * 100 * 0.05 +
      (team["FT%"] || 0) * 100 * 0.05 +
      (team.AST || 0) * 0.2 +
      (team.TRB || 0) * 0.15 +
      (team.STL || 0) * 0.2 +
      (team.BLK || 0) * 0.15 -
      (team.TOV || 0) * 0.3;

    return score;
  };

  const getMatchupWinProbability = (homeAbbr, awayAbbr, year, allTeams) => {
    const homeTeam = allTeams?.find(
      (t) => t.Tm === homeAbbr && t.Year === year && t.StatType === "per_poss"
    );
    const awayTeam = allTeams?.find(
      (t) => t.Tm === awayAbbr && t.Year === year && t.StatType === "per_poss"
    );

    if (!homeTeam || !awayTeam) return null;

    let ratingHome = getTeamStrength(homeTeam);
    let ratingAway = getTeamStrength(awayTeam);

    ratingHome += 1.5; // home court advantage

    const scaledHome = ratingHome / 20;
    const scaledAway = ratingAway / 20;

    let prob = 1 / (1 + Math.pow(10, scaledAway - scaledHome));
    return Math.max(0.05, Math.min(prob, 0.95));
  };

useEffect(() => {
  if (!newTeam?.Tm || !games.length) return;

  const seenDates = new Set();
  const uniqueGames = [];

  for (const game of games) {
    const isTeamInvolved =
      game.Team?.toUpperCase() === newTeam.Tm?.toUpperCase() ||
      game.Opponent?.toUpperCase() === newTeam.Tm?.toUpperCase();

    const gameDate = game.Date?.split("T")[0];

    if (isTeamInvolved && !seenDates.has(gameDate)) {
      seenDates.add(gameDate);
      uniqueGames.push(game);
    }
  }

  const sorted = uniqueGames.sort(
    (a, b) => new Date(b.Date) - new Date(a.Date)
  );

  setNewGames(sorted.slice(0, 5));
  console.log("🎯 Final games:", sorted.slice(0, 5));
}, [games, newTeam]);


  const formatDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString() : "";

  const sameConfTeams = allTeams
    ?.filter(
      (t) =>
        t?.Year === year &&
        t?.Conf === newTeam?.Conf &&
        t?.StatType === "per_game"
    )
    .sort((a, b) => b.W - a.W) || [];

  sameConfTeams?.forEach((t, i) => (t.confRank = i + 1));

  const teamIndex = sameConfTeams?.findIndex((t) => t?.Tm === newTeam?.Tm);
  let start = Math.max(0, teamIndex - 2);
  let end = Math.min(sameConfTeams.length, start + 5);
  if (end - start < 5) start = Math.max(0, end - 5);

  const surroundingTeams = sameConfTeams?.slice(start, end) || [];

  return (
    <div className="team-section">
      <div className="ctn">
        {/* STANDINGS */}
        <div className="latest-team-info-stats-container">
          <div className="team-infos-container">
            <h1 className="card-title">2024-25 Conference Standings</h1>
            <div className="team-info-header stats">
              <span className="team-header">Team</span>
              <span className="team-vals">W</span>
              <span className="team-vals">L</span>
              <span className="team-vals">.PCT</span>
            </div>
            {surroundingTeams?.map((t) => (
              <div
                className="team-info"
                key={t?.Tm}
                style={
                  t?.Tm?.toLowerCase() === newTeam?.Tm?.toLowerCase()
                    ? {
                        backgroundColor:
                          teamColors[t?.Tm?.toLowerCase()]?.primary,
                      }
                    : {}
                }
              >
                <div className="team-info-detail stats">
                  <div className="team-info-data stats">
                    <div className="team-vals opp">
                      <span className="team-info-rank">{t?.confRank}</span>
                      <div className="opp-info-container">
                        <div className="opp-logo-container">
                          <img
                            src={`/logos/${t?.Tm}.png`}
                            className="latest-team-logo"
                            alt={t?.Team}
                          />
                        </div>
                        <div className="team-info-name">
                          {t?.Team?.split(" ").pop()}
                        </div>
                      </div>
                    </div>
                    <div className="team-vals">{t?.W}</div>
                    <div className="team-vals">{t?.L}</div>
                    <div className="team-vals">{t?.["W/L%"]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="latest-team-info-stats-container">
          <div className="team-infos-container">
            <h1 className="card-title">Schedule</h1>
            <div className="team-info-header stats">
              <span className="team-vals">DATE</span>
              <span className="team-vals matchup">MATCHUP</span>
              <span className="team-vals">ODDS</span>
            </div>
            {newGames?.map((game, index) => {
              const isHome = game?.Location !== "@";
              const homeAbbr = isHome ? newTeam?.Tm : game?.Opponent;
              const awayAbbr = isHome ? game?.Opponent : newTeam?.Tm;

              const prob = getMatchupWinProbability(
                homeAbbr,
                awayAbbr,
                year,
                allTeams
              );
              let predictionDisplay = "N/A";
              let probNumber = 0;

              if (prob) {
                const isNewTeamHome = homeAbbr === newTeam?.Tm;
                const newTeamProb = isNewTeamHome ? prob : 1 - prob;

                probNumber = Math.round(newTeamProb * 100);
                predictionDisplay = `${probNumber}%`;
              }

              let colorStyle = {};
              if (probNumber > 50) colorStyle = { color: "green" };
              else if (probNumber < 50) colorStyle = { color: "red" };
              else colorStyle = { color: "white" };

              return (
                <div className="team-info" key={index}>
                  <div className="team-info-detail stats">
                    <div className="team-info-data stats">
                      <div className="team-vals">{formatDate(game?.Date)}</div>
                      <div className="team-vals matchup">
                        <div className="opp-info-container">
                          <div className="opp-logo-container">
                            <img
                              src={`/logos/${isHome ? game?.Opponent : newTeam?.Tm}.png`}
                              className="latest-team-logo"
                              alt={game?.Opponent}
                            />
                          </div>
                          <div className="team-info-name">
                            {isHome
                              ? game?.Opponent?.toUpperCase()
                              : newTeam?.Tm?.toUpperCase()}
                          </div>
                        </div>
                        <div>@</div>
                        <div className="opp-info-container">
                          <div className="opp-logo-container">
                            <img
                              src={`/logos/${isHome ? newTeam?.Tm : game?.Opponent}.png`}
                              className="latest-team-logo"
                              alt={newTeam?.Team}
                            />
                          </div>
                          <div className="team-info-name">
                            {isHome
                              ? newTeam?.Tm?.toUpperCase()
                              : game?.Opponent?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="team-vals" style={colorStyle}>
                        {predictionDisplay}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="ctn">
        <LeadersCard players={newRoster || []} newPlayers={newRoster || []} />
        <TeamRankingsCard tm={newTeam?.Tm?.toLowerCase?.() || ""} year={year} />
      </div>
    </div>
  );
}
