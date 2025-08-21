import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

export default function Dropdown({ options, value, onChange }) {
  return (
    <div className="dropdown-container">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="native-dropdown"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Dropdown Icon */}
      <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
    </div>
  );
}
