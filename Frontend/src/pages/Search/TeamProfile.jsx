import TeamInfo from "./TeamInfo";
import players from "/all_players.json";
import teams from "/teams.json";

export default function TeamProfile({ team }) {
  console.log("team", team);

  
  return (
    <div style={{ color: "white" }}>
      {team || "No team found"}
    </div>
  );
}
