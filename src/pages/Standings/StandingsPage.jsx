import "./StandingsPage.css";
import Standings from "./StandingComponent/Standings";
import StandingsCarousel from "./StandindsCarousel";

export default function StandingsPage() {
  return (
    <div className="standings-page-container">
<StandingsCarousel conferences={["E", "W"]} />

    </div>
  );
}
