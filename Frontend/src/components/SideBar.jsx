import React from 'react';
import styles from '../styles/SideBar.module.css';
import { FaArrowLeft } from "react-icons/fa";
import Conversations from './Conversations';
import SidePanelMenus from './SidePanelMenus';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SideBar = ({ setOption, option }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.settings.user);

    const handleOpenMenu = () => {
        setOption(true);
        navigate("editProfile");
    };

    const handleCloseMenu = (e) => {
        e.stopPropagation();
        setOption(false);
        navigate('/dating-app');
    };

    const profilePicUrl = user.profilePics?.[0]
        ? `http://localhost:5000${user.profilePics[0]}`
        : '/default.jpg'; // fallback image

    return (
        <div className={styles.sidebar}>
            <div className={styles.profileSection} onClick={handleOpenMenu}>
                {option && (
                    <button className={styles.backButton} onClick={handleCloseMenu}>
                        <FaArrowLeft />
                    </button>
                )}
                <img
                    src={profilePicUrl}
                    alt={user.name || "Profile"}
                    className={`${styles.profilePic} ${option ? styles.slideInRight : ''}`}
                />
                {!option && <span className={styles.profileName}>{user.name || "Loading..."}</span>}
            </div>

            {option === false && <Conversations />}
            {option && <SidePanelMenus />}
        </div>
    );
};

export default SideBar;
