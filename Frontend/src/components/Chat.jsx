import React, { useState } from "react";
import styles from "../styles/Chat.module.css";
import { useNavigate } from "react-router-dom";

const Chat = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className={styles.chatWrapper}>
            <div className={styles.chatHeader}>
                <div className={styles.userInfo}>
                    <img
                        className={styles.userImage}
                        src="https://i.pinimg.com/736x/d3/90/90/d390909b9cfb70c8fd61b586bccd5cb1.jpg"
                        alt="User"
                    />
                    <span className={styles.username}>Avanjolina</span>
                </div>

                <div className={styles.right}>
                    <div className={styles.left}>
                        <button className={styles.menuButton} onClick={toggleDropdown}>
                            ⋮
                        </button>
                        {dropdownOpen && (
                            <div className={styles.dropdown}>
                                <div>Unmatch</div>
                                <div>Block</div>
                            </div>
                        )}
                    </div>
                    <button className={styles.closeButton} onClick={() => (navigate("/dating-app"))}>✕</button>
                </div>
            </div>

            <div className={styles.chatBody}>
                {/* Static chat messages */}
                <div className={styles.messageLeft}>Hey, how’s your day?</div>
                <div className={styles.messageRight}>Pretty chill, just got back from work.</div>
                <div className={styles.messageLeft}>Nice! Wanna catch up this weekend?</div>
                <div className={styles.messageRight}>Yeah, sounds great 👌</div>
                <div className={styles.messageLeft}>Cool! 😊</div>
                <div className={styles.messageLeft}>Hey, how’s your day?</div>
                <div className={styles.messageRight}>Pretty chill, just got back from work.</div>
                <div className={styles.messageLeft}>Nice! Wanna catch up this weekend?</div>
                <div className={styles.messageRight}>Yeah, sounds great 👌</div>
                <div className={styles.messageLeft}>Cool! 😊</div>
                <div className={styles.messageLeft}>Hey, how’s your day?</div>
                <div className={styles.messageRight}>Pretty chill, just got back from work.</div>
                <div className={styles.messageLeft}>Nice! Wanna catch up this weekend?</div>
                <div className={styles.messageRight}>Yeah, sounds great 👌</div>
                <div className={styles.messageLeft}>Cool! 😊</div>
            </div>

            <div className={styles.chatInputArea}>
                <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className={styles.sendButton}>➤</button>
            </div>
        </div>
    );
};

export default Chat;