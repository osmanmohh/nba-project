import { useState } from "react";
import StatsTable from "../Search/StatsTable/StatsTable";
import Dropdown from "../../components/Dropdown/Dropdown";
import "./StatsPage.css";
import LeadersCard from "../Search/LeadersCard";
import { useEffect } from "react";

export default function StatsPage() {
  //  State for stats type (Players or Teams)
  const [statsType, setStatsType] = useState("Players");
  const [playerStats, setPlayerStats] = useState([]);
  const [teamStats, setTeamStats] = useState([]);

  //  State for selected season, position (for players), division (for teams), and conference
  const [selectedSeason, setSelectedSeason] = useState("2025");
  const [selectedPosition, setSelectedPosition] = useState("All Positions");
  const [selectedConference, setSelectedConference] = useState("All NBA");
  const [selectedDivision, setSelectedDivision] = useState("All Divisions");

  useEffect(() => {
    fetch(`/api/player/stats/all?year=${selectedSeason}&stat_type=Per%20Game`)
      .then((response) => response.json())
      .then((data) => {
        setPlayerStats(data);
      })
      .catch((error) => {
        console.error("Error fetching player stats:", error);
      });
  }, [selectedSeason]);

  useEffect(() => {
    fetch(`/api/team/year/${selectedSeason}`)
      .then((response) => response.json())
      .then((data) => {
        setTeamStats(data.filter((team) => team.StatType === "per_game"));
      })
      .catch((error) => {
        console.error("Error fetching team stats:", error);
      });
  }, [selectedSeason]);
  //  Season Options (All seasons from 2000 - 2024)
  const seasonOptions = Array.from(
    { length: new Date().getFullYear() - 1946 },
    (_, i) => {
      const year = 1947 + i;
      return {
        value: year.toString(),
        label: `${year - 1}-${String(year).slice(-2)}`,
      };
    }
  ).reverse();

  //  Conference Options
  const conferenceOptions = [
    { value: "All NBA", label: "All NBA" },
    { value: "W", label: "Western Conference" },
    { value: "E", label: "Eastern Conference" },
  ];

  //  Position Options (For Player Stats)
  const positionOptions = [
    { value: "All Positions", label: "All Positions" },
    { value: "PG", label: "Point Guard" },
    { value: "SG", label: "Shooting Guard" },
    { value: "SF", label: "Small Forward" },
    { value: "PF", label: "Power Forward" },
    { value: "C", label: "Center" },
  ];

  //  Division Options (For Team Stats)
  const divisionOptions = [
    { value: "All Divisions", label: "All Divisions" },
    { value: "Atlantic", label: "Atlantic Division" },
    { value: "Central", label: "Central Division" },
    { value: "Southeast", label: "Southeast Division" },
    { value: "Northwest", label: "Northwest Division" },
    { value: "Pacific", label: "Pacific Division" },
    { value: "Southwest", label: "Southwest Division" },
  ];

  //  Convert "2024" → "2023-24" dynamically for title
  const formattedSeason = `${parseInt(selectedSeason, 10) - 1}-${selectedSeason.slice(-2)}`;

  //  Filter Player Data
  const filteredPlayerData = playerStats.filter(
    (player) =>
      player.Year.toString() === selectedSeason &&
      (selectedConference === "All NBA" ||
        player.Conf === selectedConference) &&
      (selectedPosition === "All Positions" ||
        player.Pos === selectedPosition) &&
      (player.G >= 15 ||
        player.MP >= 8.0 ||
        player.PTS >= 5.0 ||
        player.WS >= 0.2)
  );
 

  //  Filter Team Data
  const filteredTeamData = teamStats.filter(
    (team) =>
      team.Year.toString() === selectedSeason &&
      (selectedConference === "All NBA" || team.Conf === selectedConference) &&
      (selectedDivision === "All Divisions" ||
        team.Division === selectedDivision) //  Filters by Division
  );

  return (
    <div className="stats-page-wrapper">
      <div className="stats-page-main">
        {/*  Dropdown to Switch Between Player & Team Stats */}

        {/*  Title Updates Dynamically */}
        <h1 className="page-title">
          {statsType === "Players"
            ? `NBA Player Stats ${formattedSeason}`
            : `NBA Team Stats ${formattedSeason}`}
        </h1>

        {/*  Dropdowns Adjust Based on Selected Stats Type */}
        <div className="dropdowns-container">
          <Dropdown
            options={seasonOptions}
            value={selectedSeason}
            onChange={setSelectedSeason}
          />
          <Dropdown
            options={conferenceOptions}
            value={selectedConference}
            onChange={setSelectedConference}
          />

          {statsType === "Players" ? (
            <Dropdown
              options={positionOptions}
              value={selectedPosition}
              onChange={setSelectedPosition}
            />
          ) : (
            <Dropdown
              options={divisionOptions}
              value={selectedDivision}
              onChange={setSelectedDivision}
            />
          )}
          <div className="stats-type-dropdown">
            <Dropdown
              options={[
                { value: "Players", label: "Player Stats" },
                { value: "Teams", label: "Team Stats" },
              ]}
              value={statsType}
              onChange={setStatsType}
            />
          </div>
        </div>

        {/*  Display Player Stats OR Team Stats Based on Selection */}
        <div className="stats-table-container">
          {statsType === "Players" ? (
            <StatsTable
              jsonData={filteredPlayerData}
              columnsToShow={[
                "Rk",
                "Name",
                "Age",
                "Tm",
                "Pos",
                "G",
                "PTS",
                "FG",
                "FGA",
                "FG%",
                "3P",
                "3PA",
                "3P%",
                "FT",
                "FTA",
                "FT%",
                "REB",
                "AST",
                "STL",
                "BLK",
                "eFG%",
              ]}
              defaultSort={{ key: "PTS", direction: "desc" }}
            />
          ) : (
            <StatsTable
              jsonData={filteredTeamData}
              columnsToShow={[
                "Team",
                "W",
                "L",
                "W/L%",
                "ORtg",
                "DRtg",
                "NRtg",
                "PTS",
                "FG%",
                "3P%",
                "FT%",
                "TRB",
                "AST",
                "STL",
                "BLK",
              ]}
              defaultSort={{ key: "W", direction: "desc" }}
            />
          )}
        </div>
        <div className="league-leaders-wrapper">
          <h1 className="team-title">League Leaders</h1>
          <div className="league-leaders">
            <div className="league-row">
              <LeadersCard players={filteredPlayerData} statCategory={"PTS"} />
              <LeadersCard players={filteredPlayerData} statCategory={"AST"} />
            </div>
            <div className="league-row">
              <LeadersCard players={filteredPlayerData} statCategory={"REB"} />
              <LeadersCard players={filteredPlayerData} statCategory={"BLK"} />
            </div>
            <div className="league-row">
              <LeadersCard players={filteredPlayerData} statCategory={"STL"} />
              <LeadersCard players={filteredPlayerData} statCategory={"3P"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
