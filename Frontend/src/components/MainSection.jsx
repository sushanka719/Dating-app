import React from "react";
import styles from "../styles/MainSection.module.css";
import Button from "./Button";
import { Link } from "react-router-dom";

const MainSection = () => {
    const randomQuotes = [
        "Love is a game, but it’s the only one worth playing.",
        "In the end, we only regret the chances we didn’t take.",
        "Love is not about finding the right person, but creating the right relationship.",
        "The best love is the one that makes you a better person without changing you into someone else."
    ];

    const randomQuote = randomQuotes[Math.floor(Math.random() * randomQuotes.length)];

    return (
        <section className={styles.mainSection}>
            <div className={styles.overlay}>
                <div className={styles.content}>
                    <h1 className={styles.mainText}>Meet, Match & Move On</h1>
                    <p className={styles.quote}>"{randomQuote}"</p>
                    <Link to='/signup'><Button className={styles.signupBtn}>Signup</Button></Link>
                </div>
            </div>
        </section>
    );
};

export default MainSection;
