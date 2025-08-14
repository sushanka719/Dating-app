import React, { useEffect, useState } from 'react';
import styles from '../styles/DatingAppHeader.module.css';
import filter from '../assets/filter.png';
import kiss from '../assets/kiss.png';
import {
    setInterestedIn,
    setAgeRange,
    updateSettings,
    fetchSettings,
} from '../store/reducers/SettingSlics';
import { fetchUsers, resetFeed } from '../store/reducers/userFeedSlice';
import { useDispatch, useSelector } from 'react-redux';

const DatingAppHeader = () => {
    const dispatch = useDispatch();
    const [showFilter, setShowFilter] = useState(false);

    const { interestedIn, ageRange } = useSelector((state) => state.settings);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const handleApply = () => {
        // Update settings on the server
        dispatch(
            updateSettings({
                interestedIn,
                preferences: {
                    minAge: ageRange[0],
                    maxAge: ageRange[1],
                },
            })
        );
        // Reset user feed and fetch new users with updated filters
        dispatch(resetFeed());
        dispatch(
            fetchUsers({
                page: 1, // Start from page 1 for new filters
                limit: 4,
                filters: {
                    interestedIn,
                    minAge: ageRange[0],
                    maxAge: ageRange[1],
                },
            })
        );
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
                <p>
                    mingle<span>Me</span>
                </p>
            </div>

            {showFilter && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h4>I’m interested in…</h4>
                        <div className={styles.options}>
                            {['Male', 'Female', 'Everyone'].map((option) => (
                                <button
                                    key={option}
                                    className={`${styles.optionBtn} ${interestedIn.toLowerCase() === option.toLowerCase() ? styles.active : ''
                                        }`}
                                    onClick={() => dispatch(setInterestedIn(option.toLowerCase()))}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        <h4>Age Range</h4>
                        <div className={styles.ageSlider}>
                            <p>
                                Between {ageRange[0]} and {ageRange[1]}
                            </p>
                            <input
                                type="range"
                                min="18"
                                max="60"
                                value={ageRange[1]}
                                onChange={(e) =>
                                    dispatch(setAgeRange([ageRange[0], +e.target.value]))
                                }
                            />
                        </div>

                        <div className={styles.actions}>
                            <button onClick={handleCancel} className={styles.cancel}>
                                Cancel
                            </button>
                            <button onClick={handleApply} className={styles.apply}>
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default DatingAppHeader;