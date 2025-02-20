import React from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ checked, onToggle, label }) => {
    return (
    <div className={`toggle-container ${isOn ? "on" : "off"}`} onClick={() => onToggle(!isOn)}>
        <div className={`toggle-circle ${isOn ? "move-right" : "move-left"}`} />
    </div>
    );
};
export default ToggleSwitch