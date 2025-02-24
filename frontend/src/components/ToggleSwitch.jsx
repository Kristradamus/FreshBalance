import React from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = ({ checked, onToggle, label }) => {
    return (
    <div className={`toggleContainer ${isOn ? "on" : "off"}`} onClick={() => onToggle(!isOn)}>
        <div className={`toggleCircle ${isOn ? "move-right" : "move-left"}`} />
    </div>
    );
};
export default ToggleSwitch