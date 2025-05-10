import React from "react";
import styles from "../styles/Button.module.css";

const Button = ({ text, onClick, type = "button", className = "", disabled = false, children }) => {
    return (
        <button
            type={type}
            className={`${styles.btn} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
