import { useState } from 'react';
import styles from '../styles/Accordion.module.css';

const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.accordion}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.accordionHeader} ${isOpen ? styles.open : ''}`}
                aria-expanded={isOpen}
            >
                <span className={styles.title}>{title}</span>
                <svg
                    className={`${styles.icon} ${isOpen ? styles.rotate : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <div
                className={`${styles.contentWrapper} ${isOpen ? styles.openContent : ''}`}
            >
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Accordion;
