import React from "react";
import { Link } from "react-router-dom"; 
import styles from "../styles/NotFound.module.css";

const NotFound = () => {
    return (
        <div className={styles.notFound}>
            <h1 className={styles.errorCode}>404</h1>
            <p className={styles.message}>
                Oops! Looks like you're lost. Maybe it’s a sign to find a match instead? 😉
            </p>
            <Link to="/" className={styles.homeButton}>Go Back Home</Link>
        </div>
    );
};

export default NotFound;
