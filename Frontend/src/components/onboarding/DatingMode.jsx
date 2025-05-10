import React, { useState } from 'react';
import styles from '../../styles/Onboarding.module.css';


const DatingMode = ({ formData, setFormData, nextStep, handleSubmit }) => {
  const [selectedMode, setSelectedMode] = useState(formData.datingMode || '');

  const handleSelect = (mode) => {
    setSelectedMode(mode);
    setFormData({ ...formData, datingMode: mode });
  };

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.title}>Choose a mode to get started</h2>
      <p className={styles.subtitle}>
        You’ll be able to switch modes once you’re all set up.
      </p>

      <div className={styles.modeOptions}>
        <div
          className={`${styles.modeOption} ${selectedMode === 'Date' ? styles.selected : ''}`}
          onClick={() => handleSelect('Date')}
        >
          <div className={styles.tickCircle}>
            {selectedMode === 'Date' && <span>&#10003;</span>}
          </div>
          <div>
            <h3 className={styles.optionTitle}>Date</h3>
            <p className={styles.optionText}>Find someone to date</p>
          </div>
        </div>

        <div
          className={`${styles.modeOption} ${selectedMode === 'BFF' ? styles.selected : ''}`}
          onClick={() => handleSelect('BFF')}
        >
          <div className={styles.tickCircle}>
            {selectedMode === 'BFF' && <span>&#10003;</span>}
          </div>
          <div>
            <h3 className={styles.optionTitle}>BFF</h3>
            <p className={styles.optionText}>Make new friends</p>
          </div>
        </div>
      </div>

      <button
        className={styles.continueButton}
        onClick={handleSubmit}
        disabled={!selectedMode}
      >
        Continue with {selectedMode || '...'}
      </button>
    </div>
  );
};

export default DatingMode;