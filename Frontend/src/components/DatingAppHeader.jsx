import React, { useState } from 'react';
import styles from '../styles/DatingAppHeader.module.css';
import filter from '../assets/filter.png';
import kiss from '../assets/kiss.png';

const DatingAppHeader = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [interestedIn, setInterestedIn] = useState('Everyone');
    const [ageRange, setAgeRange] = useState([18, 30]);

    const handleApply = () => {
        console.log('Filters:', { interestedIn, ageRange });
        setShowFilter(false);
    };

    const handleCancel = () => {
        setShowFilter(false);
    };

    return (
        <header className={styles.header}>
            <div className={styles.filter} onClick={() => setShowFilter(true)}>
                <img src={filter} alt="filter icon" />
                <p>Filters</p>
            </div>

            <div className={styles.logo}>
                <img src={kiss} alt="logo icon" />
                <p>mingle<span>Me</span></p>
            </div>

            {showFilter && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h4>I’m interested in…</h4>
                        <div className={styles.options}>
                            {['Women', 'Men', 'Everyone'].map((option) => (
                                <button
                                    key={option}
                                    className={`${styles.optionBtn} ${interestedIn === option ? styles.active : ''}`}
                                    onClick={() => setInterestedIn(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <h4>Age</h4>
                        <div className={styles.ageSlider}>
                            <p>Between {ageRange[0]} and {ageRange[1]}</p>
                            <input
                                type="range"
                                min="18"
                                max="60"
                                value={ageRange[0]}
                                onChange={(e) => setAgeRange([+e.target.value, ageRange[1]])}
                            />
                            <input
                                type="range"
                                min="18"
                                max="60"
                                value={ageRange[1]}
                                onChange={(e) => setAgeRange([ageRange[0], +e.target.value])}
                            />
                        </div>

                        <div className={styles.actions}>
                            <button onClick={handleCancel} className={styles.cancel}>Cancel</button>
                            <button onClick={handleApply} className={styles.apply}>Apply</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default DatingAppHeader;
