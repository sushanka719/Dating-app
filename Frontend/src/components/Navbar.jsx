// Navbar.js
import { useState } from "react";
import styles from "../styles/Navbar.module.css";
import kiss from '../assets/kiss.png';
import Button from "../components/Button";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <a href="#" className={styles.logo}>
                    <img src={kiss} alt="" className={styles.navLogo} />
                    <p className={styles.logoText}>MingleMe</p>
                </a>
                <Button
                    className={styles.hamburger}
                    onClick={() => setIsOpen(!isOpen)}>{isOpen ? "✖" : "☰"}</Button>
                <ul className={`${styles.navLinks} ${isOpen ? styles.show : ""}`}>
                    <li><a href="#" className={styles.link}>Home</a></li>
                    <li><a href="#" className={styles.link}>About</a></li>
                    <Link to='/signup'><Button className={styles.signupBtn} >Signup</Button></Link>
                </ul>
            </div>
        </nav>
    );
}
