import "./PlayerCard.css";

function PlayerCard() {
  return (
    <>
      <div className="player-card-container">
        <div className="rank">2</div>
        <div className="player-info">
          <div className="player-name">
            <div className="first-name">JAYSON</div>
            <div className="last-name">TATUM</div>
          </div>
          <div className="img-container">
            <img src="Boston Celtics.png" className="team-logo"></img>
            <img
              className="player-image"
              src="4065648.png"
              alt="Jayson Tatum"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayerCard;
