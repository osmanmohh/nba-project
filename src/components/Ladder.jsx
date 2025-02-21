import PlayerCard from "./PlayerCard";
import "./Ladder.css";

function Ladder({ title, players }) {
  return (
    <div className="ladder-container">
      <div className="title-container">
        <div className="gold-boxed">NBA APP</div>
        <div className="main-title">KIA RACE TO THE <span className="award-name">{title}</span></div>
        <div className="gold-boxed">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
      {players.length > 0 ? (
        players.map((player, index) => (
          <PlayerCard 
            key={player.playerId} 
            playerId={player.playerId} 
            abbreviation={player.abbreviation}
            rank={index + 1} 
          />
        ))
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}

export default Ladder;
