import { Link } from "react-router-dom";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketball } from "@fortawesome/free-solid-svg-icons";
function Home() {
  return (
    <>
      <div className="container home-page">
        <div className="text-zone">
          <h1>
            Welcome to<br></br>
            NBA Prediction Hub!
          </h1>
          <br />
          <h2>
            Get insights into the season with AI-powered predictions.<br></br>
            Just search, explore, and analyze team standings, playoffs, and
            awards...
          </h2>
            <Link to="/search" className="flat-button">GET STARTED</Link>
        </div>
        <FontAwesomeIcon
          icon={faBasketball}
          beat
          style={{ height: "15rem", color: "#ffffff" }}
        />
      </div>
    </>
  );
}

export default Home;
