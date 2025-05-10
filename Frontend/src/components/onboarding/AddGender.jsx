import React, { useState } from 'react';
import styles from '../../styles/Onboarding.module.css'; 

const AddGender = ({ formData, setFormData, nextStep, prevStep }) => {
    const [selectedGender, setSelectedGender] = useState(formData.gender || '');

    const handleSelect = (gender) => {
        setSelectedGender(gender);
        setFormData(prev => ({ ...prev, gender }));
    };

    const handleContinue = () => {
        if (selectedGender) {
            nextStep();
        }
    };

    return (
        <div className={styles.stepContainer}>
            <h2 className={styles.title}>What's your gender?</h2>

            <div className={styles.optionsContainer}>
                {['male', 'female', 'non-binary', 'other'].map((gender) => (
                    <div
                        key={gender}
                        className={`${styles.optionBox} ${selectedGender === gender ? styles.selected : ''}`}
                        onClick={() => handleSelect(gender)}
                    >
                        <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={selectedGender === gender}
                            readOnly
                            className={styles.radioInput}
                        />
                        <span className={styles.optionText}>{gender}</span>
                    </div>
                ))}
            </div>

            <button
                className={styles.continueButton}
                onClick={handleContinue}
                disabled={!selectedGender}
            >
                Continue
            </button>

            <button className={styles.logoutButton}>
                Log Out
            </button>
        </div>
    );
};

export default AddGender;
