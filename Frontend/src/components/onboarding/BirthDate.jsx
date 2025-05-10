// BirthDate.jsx
import React, { useState } from 'react';
import styles from '../../styles/Onboarding.module.css';

const BirthDate = ({ formData, setFormData, nextStep, prevStep }) => {
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleContinue = () => {
        if (month && day && year) {
            const birthdate = `${year}-${months.indexOf(month) + 1}-${day}`;
            setFormData(prev => ({ ...prev, birthdate }));
            nextStep();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.heading}>Hey, what's your birthday?</h2>

                <div className={styles.dropdownContainer}>
                    <select
                        className={styles.dropdown}
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        <option value="">Month</option>
                        {months.map((m, idx) => (
                            <option key={idx} value={m}>{m}</option>
                        ))}
                    </select>

                    <select
                        className={styles.dropdown}
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                    >
                        <option value="">Day</option>
                        {days.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <select
                        className={styles.dropdown}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="">Year</option>
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <p className={styles.noticeText}>You must be at least 18 years old to use the app.</p>

                <button className={styles.button} onClick={handleContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
};

export default BirthDate;
