import PlayoffBracket from "../../../components/PlayoffBracket";
import "./index.css";

export default function Playoffs() {
  return (
    <div className="playoff-container">
      <div className="playoff-page">
        <img src="logos/playoffs.png" className="playoff-logo"></img>
        <div className="west-title">WESTERN CONFERENCE</div>
        <div className="east-title">EASTERN CONFERENCE</div>
        <PlayoffBracket></PlayoffBracket>
      </div>
    </div>
  );
}
