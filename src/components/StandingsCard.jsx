import "./StandingsCard.css";

function StandingsCard({ abbr, rank, wins, losses }) {
  const teamColors = {
    atl: { primary: "#B00E26" },
    bos: { primary: "#00662B" },
    bkn: { primary: "#000000" },
    cha: { primary: "#190E50" },
    chi: { primary: "#B00E38" },
    cle: { primary: "#750032" },
    dal: { primary: "#00477B" },
    den: { primary: "#0B1D36" },
    det: { primary: "#B00E26" },
    gsw: { primary: "#192C6A" },
    hou: { primary: "#B00E26" },
    ind: { primary: "#00254F" },
    lac: { primary: "#B00E26" },
    lal: { primary: "#4A1F73" },
    mem: { primary: "#4E6794" },
    mia: { primary: "#840028" },
    mil: { primary: "#003E18" },
    min: { primary: "#081C36" },
    nop: { primary: "#081C36" },
    nyk: { primary: "#005B9E" },
    okc: { primary: "#006AAE" },
    orl: { primary: "#0067A6" },
    phi: { primary: "#005B9E" },
    phx: { primary: "#190E50" },
    por: { primary: "#C03134" },
    sac: { primary: "#4A2673" },
    sas: { primary: "#A5ADB4" },
    tor: { primary: "#B00E26" },
    uta: { primary: "#00224C" },
    was: { primary: "#00224C" },
  };

  // Get team colors (default to gray if team is unknown)
  const teamColor = teamColors[abbr] || { primary: "#808080" };

  return (
    <div className="standings-card-container">
      <div className="playoff-rank">{rank}</div>
      <div className="info" style={{ backgroundColor: teamColor.primary }}>
        <div className="logo-container">
          <img
            src={`logos/${abbr.toLowerCase()}.png`}
            className="logo"
            alt={`${abbr} logo`}
          />
        </div>
        <div className="team-record">
          {wins}-{losses}
        </div>
      </div>
    </div>
  );
}

export default StandingsCard;
