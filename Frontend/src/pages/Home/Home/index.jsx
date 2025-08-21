import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketball } from "@fortawesome/free-solid-svg-icons";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page-container">
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
          <button className="flat-button" onClick={() => navigate("/search")}>
            GET STARTED
          </button>
        </div>
        <FontAwesomeIcon
          className="basketball-icon"
          icon={faBasketball}
          beat
          style={{ color: "#ffffff" }}
        />
      </div>
    </div>
  );
}

export default Home;
