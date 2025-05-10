import React, { useState } from 'react';
import styles from '../styles/VerifyEmail.module.css'; 
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate()

    const handleResendEmail = () => {
        setEmailSent(true);
        alert('Verification email has been sent again!');
    };

    return (
        <div className={styles.verifyEmailContainer}>
            <div className={styles.messageBox}>
                <h1 className={styles.headerText}>Before you login. Please verify your account by clicking on the link send to your account.</h1>
                <p className={styles.infoText}>Haven't received a verification email? No worries!</p>
                <div className={styles.btncontainer}>
                    <Button onClick={handleResendEmail}>
                        Send again
                    </Button>
                    <Button onClick={() => navigate('/login')}>
                        Back to login
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default VerifyEmail;
