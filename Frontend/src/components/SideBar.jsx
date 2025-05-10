import React, { useState } from 'react';
import styles from '../styles/SideBar.module.css';
import profile from '../assets/profile.jpg';
import { FaArrowLeft } from "react-icons/fa";
import Conversations from './Conversations';
import SidePanelMenus from './SidePanelMenus';
import { useNavigate } from 'react-router-dom';

const SideBar = ({setOption, option}) => {
    const navigate = useNavigate();

    const handleOpenMenu = () => {
        setOption(true);
        navigate("editProfile")
    };

    const handleCloseMenu = (e) => {
        e.stopPropagation();
        setOption(false);
        navigate('/dating-app')
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.profileSection} onClick={handleOpenMenu}>
                {option && (
                    <button className={styles.backButton} onClick={handleCloseMenu}>
                        <FaArrowLeft />
                    </button>
                )}
                <img
                    src={profile}
                    alt="Profile"
                    className={`${styles.profilePic} ${option ? styles.slideInRight : ''}`}
                />
                {!option && <span className={styles.profileName}>Sushanka</span>}
            </div>
            {option === false && <Conversations/>}
            {option &&  <SidePanelMenus/>}
        </div>
    );
};

export default SideBar;
