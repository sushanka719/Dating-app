import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiArrowDropDownLine } from 'react-icons/ri';
import styles from '../styles/Conversations.module.css';
import { useNavigate } from 'react-router-dom';
import { getMatches, getMessagesWithUser, setSelectedUser } from '../store/reducers/chatSlice';


const Conversations = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chatsState = useSelector((state) => state.chats || {});
  const { matches = [], isLoading = false } = chatsState;

  useEffect(() => {
    dispatch(getMatches());
  }, [dispatch]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleConvo = (userId) => {
    dispatch(setSelectedUser(userId));
    dispatch(getMessagesWithUser());
    navigate('chat')
  };

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

      {!isLoading && matches.length > 0 ? (
        matches.map((user) => (
          <div
            key={user._id}
            className={styles.conversation}
            onClick={() => handleConvo(user._id)}
          >
            <img
              src={`http://localhost:5000${user.profilePic}`}
              alt={`Profile picture of ${user.name}`}
              className={styles.profilePic}
              onError={(e) => {
                e.target.src = '/path/to/fallback-image.jpg'; // Fallback image
              }}
            />
            <div className={styles.details}>
              <p className={styles.name}>{user.name}</p>
              <p className={styles.preview}>
                {chatsState.messages[user._id]?.slice(-1)[0]?.text || 'No messages yet'}
              </p>
            </div>
          </div>
        ))
      ) : (
        !isLoading && <p>No conversations available</p>
      )}
    </div>
  );
};

export default Conversations;