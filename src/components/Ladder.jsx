import PlayerCard from "./PlayerCard";
import "./Ladder.css";

function Ladder({ title, players }) {
  return (
    <div className="ladder-container">
        <div className="ladder-title">{title}</div>
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
