import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import PlayoffCard from "./PlayoffCard";
import "./PlayoffBracket.css";

const csvFilePath = "public/nba_playoff_results.csv"; // Update with the actual file path

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
    <div className="bracket-container">
            <div className="east-title">EASTERN CONFERENCE</div>
            <div className="west-title">WESTERN CONFERENCE</div>

      <div className="playoff-title">
        <img className="playoff-nba-logo" src="/logos/nba.png"></img>
        <p>PLAYOFFS</p>
      </div>
      <div className="bracket">
        {["e-round-1", "e-round-2", "e-round-3", "nba-finals"].map((round) => (
          <div key={round} className={`round-container ${round}`}>
            {playoffData
              .filter((game) => game.Round === round)
              .map((matchup, index) => (
                <div key={index} className={`round ${round}`}>
                  <PlayoffCard
                    abbr={matchup["Team 1 tm"]}
                    rank={matchup["Team 1 Rank"]}
                    wins={null}
                    losses={null}
                  />
                  <PlayoffCard
                    abbr={matchup["Team 2 tm"]}
                    rank={matchup["Team 2 Rank"]}
                    wins={null}
                    losses={null}
                  />
                </div>
              ))}
          </div>
        ))}
        {["w-round-3", "w-round-2", "w-round-1"].map((round) => (
          <div key={round} className={`round-container ${round}`}>
            {playoffData
              .filter((game) => game.Round === round)
              .map((matchup, index) => (
                <div key={index} className={`round ${round}`}>
                  <PlayoffCard
                    abbr={matchup["Team 1 tm"]}
                    rank={matchup["Team 1 Rank"]}
                    wins={null}
                    losses={null}
                  />
                  <PlayoffCard
                    abbr={matchup["Team 2 tm"]}
                    rank={matchup["Team 2 Rank"]}
                    wins={null}
                    losses={null}
                  />
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlayoffBracket;
