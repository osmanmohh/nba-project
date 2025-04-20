import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import PlayoffCard from "./PlayoffCard";
import FinalsCard from "../pages/Playoffs/FinalsCard";
import "./PlayoffBracket.css";

const csvFilePath = "/nba_playoff_results2.csv"; // Update with the actual file path

function PlayoffBracket() {
  const [playoffData, setPlayoffData] = useState([]);

  useEffect(() => {
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (result) => {
            setPlayoffData(result.data);
          },
        });
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  return (
    <div className="bracket">
      <div className="playoff-conference west">
        {["w-round-1", "w-round-2", "w-round-3"].map((round) => (
          <div key={round} className={`round-container ${round}`}>
            <div className={`connector ${round}`}>
              <div className="mid-line"></div>
            </div>
            <div className={`connector btm ${round}`}></div>
            {playoffData
              .filter((game) => game.Round === round)
              .map((matchup, index) => {
                // Extract all game scores into an array
                const gameScores = Array.from({ length: 7 }, (_, i) => [
                  matchup[`Game ${i + 1} Team 1 Pts`],
                  matchup[`Game ${i + 1} Team 2 Pts`],
                ]).filter(([t1, t2]) => t1 !== null && t2 !== null); // Remove unplayed games

                const lastGamePlayed = matchup["Games Played"];
                const finalTeam1Points =
                  matchup[`Game ${lastGamePlayed} Team 1 Pts`];
                const finalTeam2Points =
                  matchup[`Game ${lastGamePlayed} Team 2 Pts`];

                return (
                  <PlayoffCard
                    key={index}
                    team1Abbr={matchup["Team 1 tm"]}
                    team1Name={matchup["Team 1 Name"]}
                    rank1={matchup["Team 1 Rank"]}
                    team2Abbr={matchup["Team 2 tm"]}
                    team2Name={matchup["Team 2 Name"]}
                    rank2={matchup["Team 2 Rank"]}
                    winner={matchup["Winner tm"]}
                    gamesPlayed={matchup["Games Played"]}
                    gameScores={gameScores} // Pass full game score array
                    finalTeam1Points={finalTeam1Points}
                    finalTeam2Points={finalTeam2Points}
                  />
                );
              })}
          </div>
        ))}
      </div>
      <div className="playoff-conference finals">
        <div className="middle-line"></div>

        <div key="nba-finals" className={"round-container nba-finals"}>
          {playoffData
            .filter((game) => game.Round === "nba-finals")
            .map((matchup, index) => {
              const gameScores = Array.from({ length: 7 }, (_, i) => [
                matchup[`Game ${i + 1} Team 1 Pts`],
                matchup[`Game ${i + 1} Team 2 Pts`],
              ]).filter(([t1, t2]) => t1 !== null && t2 !== null); // Remove unplayed games
              const lastGamePlayed = matchup["Games Played"];
              const team1PointsKey = `Game ${lastGamePlayed} Team 1 Pts`;
              const team2PointsKey = `Game ${lastGamePlayed} Team 2 Pts`;

              return (
                <FinalsCard
                  key={index}
                  team1Abbr={matchup["Team 1 tm"]}
                  team1Name={matchup["Team 1 Name"]}
                  rank1={matchup["Team 1 Rank"]}
                  team1Points={matchup[team1PointsKey]}
                  team2Abbr={matchup["Team 2 tm"]}
                  team2Name={matchup["Team 2 Name"]}
                  rank2={matchup["Team 2 Rank"]}
                  team2Points={matchup[team2PointsKey]}
                  winner={matchup["Winner tm"]}
                  gamesPlayed={matchup["Games Played"]}
                  gameScores={gameScores}
                />
              );
            })}
        </div>
      </div>
      <div className="playoff-conference east">
        {["e-round-3", "e-round-2", "e-round-1"].map((round) => (
          <div key={round} className={`round-container ${round}`}>
            <div className={`connector ${round}`}>
              <div className="mid-line"></div>
            </div>
            <div className={`connector btm ${round}`}></div>

            {playoffData
              .filter((game) => game.Round === round)
              .map((matchup, index) => {
                // Extract all game scores into an array
                const gameScores = Array.from({ length: 7 }, (_, i) => [
                  matchup[`Game ${i + 1} Team 1 Pts`],
                  matchup[`Game ${i + 1} Team 2 Pts`],
                ]).filter(([t1, t2]) => t1 !== null && t2 !== null); // Remove unplayed games

                const lastGamePlayed = matchup["Games Played"];
                const finalTeam1Points =
                  matchup[`Game ${lastGamePlayed} Team 1 Pts`];
                const finalTeam2Points =
                  matchup[`Game ${lastGamePlayed} Team 2 Pts`];

                return (
                  <PlayoffCard
                    key={index}
                    team1Abbr={matchup["Team 1 tm"]}
                    team1Name={matchup["Team 1 Name"]}
                    rank1={matchup["Team 1 Rank"]}
                    team2Abbr={matchup["Team 2 tm"]}
                    team2Name={matchup["Team 2 Name"]}
                    rank2={matchup["Team 2 Rank"]}
                    winner={matchup["Winner tm"]}
                    gamesPlayed={matchup["Games Played"]}
                    gameScores={gameScores} // Pass full game score array
                    finalTeam1Points={finalTeam1Points}
                    finalTeam2Points={finalTeam2Points}
                  />
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayoffBracket;
