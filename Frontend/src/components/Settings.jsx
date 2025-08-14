import React, { useCallback, useEffect, useState } from 'react';
import MenuNavBar from './MenuNavBar';
import Accordion from '../components/Accordion';
import kiss from '../assets/kiss.png';
import styles from '../styles/Settings.module.css';
import { useOutletContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSnoozeMode,
  setInterestedIn,
  setAgeRange,
  setConnectionType,
  updateSettings,
  fetchSettings,
} from '../store/reducers/SettingSlics';
import { debounce } from 'lodash';

const Settings = () => {
  const dispatch = useDispatch();
  const { snoozeMode, interestedIn, ageRange: reduxAgeRange, connectionType } = useSelector(
    (state) => state.settings
  );
  const { setOption } = useOutletContext();

  // Local state for immediate UI response
  const [localAge, setLocalAge] = useState(reduxAgeRange[1]);
  console.log('Redux age range:', reduxAgeRange[1]);
  console.log('Local age:', localAge);


  // Sync local state when Redux state changes
  useEffect(() => {
    setLocalAge(reduxAgeRange[1]);
  }, [reduxAgeRange]);

  useEffect(() => {
    dispatch(fetchSettings());
  },[dispatch] )

  // Debounced update to Redux and API
  const debouncedAgeUpdate = useCallback(
    debounce((value) => {
      const newRange = [18, value];
      dispatch(setAgeRange(newRange));
      dispatch(updateSettings({ preferences: { minAge: 18, maxAge: value } }));
    }, 300),
    [dispatch]
  );

  const handleAgeChange = (value) => {
    const numValue = parseInt(value);
    setLocalAge(numValue); // Immediate UI update
    debouncedAgeUpdate(numValue); // Debounced Redux/API update
  };

  const handleConnectionChange = (e) => {
    const value = e.target.value;
    dispatch(setConnectionType(value));
    dispatch(updateSettings({ lookingfor: value }));
  };

  const handleLogout = () => {
    alert('Logged out!');
  };

  const handleInterestChange = (value) => {
    dispatch(setInterestedIn(value));
    dispatch(updateSettings({ interestedIn: value }));
  };

  const toggleSnooze = () => {
    dispatch(setSnoozeMode(!snoozeMode));
    dispatch(updateSettings({ snoozeMode: !snoozeMode }));
  };

  const handleDeleteAccount = () => {
    alert('Account deleted!');
  };

  useEffect(() => {
    return () => {
      debouncedAgeUpdate.cancel();
    };
  }, [debouncedAgeUpdate]);

  return (
    <>
      <MenuNavBar title={'Settings'} setOption={setOption} />
      <div className={styles.container}>
        <Accordion title={'Type of Connection'}>
          <div className={styles.connectionContainer}>
            <select
              className={styles.select}
              value={connectionType}
              onChange={handleConnectionChange}
            >
              <option value="date">Date</option>
              <option value="bff">Bff</option>
            </select>
          </div>
        </Accordion>

        {/* Snooze Mode */}
        <Accordion title={'Snooze Mode'}>
          <div className={styles.snoozeContainer}>
            <span className={styles.snoozeText}>
              Snooze your account temporarily
            </span>
            <button
              onClick={toggleSnooze}
              className={`${styles.button} ${snoozeMode ? styles.snoozeOn : styles.snoozeOff
                }`}
            >
              {snoozeMode ? 'ON' : 'OFF'}
            </button>
          </div>
        </Accordion>

        <Accordion title={'Filters'}>
          <div className={styles.filtersContainer}>
            {/* Interested In */}
            <div>
              <label className={styles.filterLabel}>I'm interested in:</label>
              <div className={styles.pillButtonGroup}>
                {['Female', 'Male', 'Everyone'].map((option) => (
                  <button
                    key={option}
                    className={`${styles.pillButton} ${interestedIn === option.toLowerCase()
                        ? styles.pillButtonActive
                        : ''
                      }`}
                    onClick={() => handleInterestChange(option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range */}
            <div>
              <label className={styles.filterLabel}>Preferred Age Range:</label>
              <input
                type="range"
                min="18"
                max="60"
                value={localAge}  // Use local state here
                onChange={(e) => handleAgeChange(e.target.value)}
                className={styles.rangeSlider}
              />
              <div className={styles.ageRangeText}>18 - {localAge} years</div>
            </div>
            </div>
        </Accordion>

        {/* Logout and Delete Account */}
        <div className={styles.actionButtons}>
          <button
            onClick={handleLogout}
            className={`${styles.button} ${styles.logoutButton}`}
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className={`${styles.button} ${styles.deleteButton}`}
          >
            Delete Account
          </button>
          <div className={styles.footer}>
            <img src={kiss} alt="icon" className={styles.kissIcon} />
            <div className={styles.appName}>MingleMe</div>
            <div className={styles.creator}>Created with ❤️</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
