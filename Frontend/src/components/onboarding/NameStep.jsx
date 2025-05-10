// AddGender.jsx
import React, { useState } from 'react';
import styles from '../../styles/Onboarding.module.css'; 

const AddGender = ({ formData, setFormData, nextStep }) => {
    const [name, setName] = useState(formData.name || '');

    const handleContinue = () => {
        if (name.trim() !== '') {
            setFormData(prev => ({ ...prev, name }));
            nextStep();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.heading}>What do you like to be called?</h2>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className={styles.button} onClick={handleContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default AddGender;
