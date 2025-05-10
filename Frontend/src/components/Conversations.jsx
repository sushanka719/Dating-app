import React, { useState } from 'react';
import { RiArrowDropDownLine } from "react-icons/ri";
import Profile from '../assets/profile.jpg';
import styles from '../styles/Conversations.module.css';
import { useNavigate } from 'react-router-dom';

const Conversations = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const handleConvo = () => {
    navigate('chat')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span onClick={toggleDropdown} className={styles.dropdownIcon}>
            <RiArrowDropDownLine />
          </span>
          Conversations <span className={styles.recentTag}>(Recent)</span>
        </h1>

        {showDropdown && (
          <div className={styles.dropdown}>
            <p>Archived</p>
            <p>Unread</p>
            <p>Blocked</p>
          </div>
        )}
      </div>

      <div className={styles.conversation} onClick={handleConvo}>
        <img
          src={Profile}
          alt='circular conversation image of a person'
          className={styles.profilePic}
        />
        <div className={styles.details}>
          <p className={styles.name}>Sushannka Karki</p>
          <p className={styles.preview}>Conversation preview hello ......</p>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
