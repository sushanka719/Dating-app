import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import { getMatches, getMessagesWithUser, setSelectedUser, clearSelectedUser, addMessage, markMessageAsSeen } from '../store/reducers/chatSlice';

// Initialize Socket.IO
const socket = io('http://localhost:5000', { withCredentials: true });

const Chat = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [sendError, setSendError] = useState(null); // Add error state for feedback
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chatBodyRef = useRef(null); // For scrolling
    const chatsState = useSelector((state) => state.chats || {});
    const { matches = [], messages = {}, isLoading = false, error = null, selectedUserId } = chatsState;
    const userId = useSelector((state) => state.settings.userId);

    // Find the selected user from matches
    const selectedUser = matches.find((user) => user._id === selectedUserId) || {};
    const userName = selectedUser.name || 'Select a conversation';
    const profilePicUrl = selectedUser.profilePic
        ? `http://localhost:5000${selectedUser.profilePic}`
        : '/path/to/fallback-image.jpg';

    // Fetch matches and messages
    useEffect(() => {
        if (userId) {
            dispatch(getMatches());
            dispatch(getMessagesWithUser());
            socket.emit('user-connected', userId);
        }

        socket.on('receive-message', (message) => {
            const matchId = message.sender === userId ? message.receiver : message.sender;
            dispatch(addMessage({ matchId, message }));
        });

        socket.on('message-seen', ({ messageId }) => {
            dispatch(markMessageAsSeen({ matchId: selectedUserId, messageId }));
        });

        socket.on('error', ({ message }) => {
            console.error('Socket error:', message);
            setSendError('Failed to send message. Please try again.');
        });

        return () => {
            socket.off('receive-message');
            socket.off('message-seen');
            socket.off('error');
        };
    }, [dispatch, userId, selectedUserId]);

    // Mark unseen messages as seen
    useEffect(() => {
        if (selectedUserId && userId) {
            const unseenMessages = (messages[selectedUserId] || []).filter(
                (msg) => msg.receiver === userId && !msg.seen
            );
            unseenMessages.forEach((msg) => {
                socket.emit('mark-seen', { messageId: msg._id });
            });
        }
    }, [selectedUserId, messages, userId]);

    // Scroll to bottom
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, selectedUserId]);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSendMessage = () => {
        console.log("see if userid exists on senidng", userId)
        if (!message.trim()) {
            setSendError('Message cannot be empty');
            return;
        }
        if (!selectedUserId) {
            setSendError('No user selected');
            return;
        }
        if (!userId) {
            setSendError('User not authenticated');
            return;
        }

        const newMessage = {
            sender: userId,
            receiver: selectedUserId,
            content: message,
            seen: false,
            _id: Date.now().toString(), // Temporary ID until server assigns one
            createdAt: new Date().toISOString(),
        };

        // Optimistically add message to Redux store
        dispatch(addMessage({ matchId: selectedUserId, message: newMessage }));

        // Emit message via Socket.IO
        socket.emit('send-message', {
            sender: userId,
            receiver: selectedUserId,
            content: message,
        }, (response) => {
            if (response && response.error) {
                console.error('Error sending message:', response.error);
                setSendError('Failed to send message');
                // Optionally, remove the optimistic message from Redux if needed
            }
        });

        setMessage('');
        setSendError(null); // Clear any previous errors
    };

    const handleUnmatch = async () => {
        if (!selectedUserId || !userId) return;
        try {
            await axios.post(
                'http://localhost:5000/api/unmatch',
                { userId: selectedUserId },
                { withCredentials: true }
            );
            dispatch(clearSelectedUser());
            dispatch(getMatches());
            dispatch(getMessagesWithUser());
            setDropdownOpen(false);
        } catch (error) {
            console.error('Error unmatching:', error);
        }
    };

    const handleBlock = async () => {
        if (!selectedUserId || !userId) return;
        try {
            await axios.post(
                'http://localhost:5000/api/block',
                { userId: selectedUserId },
                { withCredentials: true }
            );
            dispatch(clearSelectedUser());
            dispatch(getMatches());
            dispatch(getMessagesWithUser());
            setDropdownOpen(false);
        } catch (error) {
            console.error('Error blocking:', error);
        }
    };

    const selectMatch = (matchId) => {
        dispatch(setSelectedUser(matchId));
    };

    if (!selectedUserId) {
        return (
            <div className={styles.chatWrapper}>
                <div className={styles.chatBody}>
                    <div className={styles.noConversation}>
                        {matches.length > 0 ? 'Click on any user to chat' : 'No matches available'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatWrapper}>
            {/* ==== HEADER ==== */}
            <div className={styles.chatHeader}>
                <div className={styles.userInfo}>
                    <img
                        className={styles.userImage}
                        src={profilePicUrl}
                        alt={`Profile picture of ${userName}`}
                    />
                    <span className={styles.username}>{userName}</span>
                </div>
                <div className={styles.right}>
                    <div className={styles.left}>
                        <button className={styles.menuButton} onClick={toggleDropdown}>
                            ⋮
                        </button>
                        {dropdownOpen && (
                            <div className={styles.dropdown}>
                                <div onClick={handleUnmatch}>Unmatch</div>
                                <div onClick={handleBlock}>Block</div>
                            </div>
                        )}
                    </div>
                    <button className={styles.closeButton} onClick={() => navigate('/dating-app')}>
                        ✕
                    </button>
                </div>
            </div>

            {/* ==== CHAT BODY ==== */}
            <div className={styles.chatBody} ref={chatBodyRef}>
                {isLoading && <div>Loading messages...</div>}
                {error && <div>Error: {error}</div>}
                {(messages[selectedUserId] || []).map((msg) => (
                    <div
                        key={msg._id}
                        className={msg.sender === userId ? styles.messageRight : styles.messageLeft}
                    >
                        {msg.content}
                        {msg.sender === userId && msg.seen && (
                            <span className={styles.seen}> (Seen)</span>
                        )}
                    </div>
                ))}
            </div>

            {/* ==== INPUT AREA ==== */}
            <div className={styles.chatInputArea}>
                {sendError && <div className={styles.errorMessage}>{sendError}</div>}
                <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className={styles.sendButton} onClick={handleSendMessage}>
                    ➤
                </button>
            </div>
        </div>
    );
};

export default Chat;