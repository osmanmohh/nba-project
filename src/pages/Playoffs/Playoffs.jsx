import PlayoffBracket from "/Users/osmanmohamed/nba-project/src/components/PlayoffBracket.jsx";
import "./Playoffs.css";

export default function Playoffs() {
  return (
    <div className="playoff-page">
          <img src="logos/playoffs.png" className="playoff-logo"></img>

      <div className="west-title">WESTERN CONFERENCE</div>
      <div className="east-title">EASTERN CONFERENCE</div>
      <PlayoffBracket></PlayoffBracket>
    </div>
  );
}
