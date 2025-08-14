import { useState, useEffect, useRef } from 'react';
import styles from '../styles/BumblePartnerSelector.module.css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import DatingAppHeader from './DatingAppHeader';


const BumblePartnerSelector = () => {
    const [users, setUsers] = useState([]);
    const [currentUserIndex, setCurrentUserIndex] = useState(0);
    const [page, setPage] = useState(2);
    const [loading, setLoading] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false); // New state for fetching next page
    const [error, setError] = useState(null);
    const cardRef = useRef(null);

    const [showMatchModal, setShowMatchModal] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null);

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            // Only show main loading on initial load
            if (users.length === 0) {
                setLoading(true);
            } else {
                setFetchingMore(true); // Show fetching state for subsequent pages
            }

            try {
                const response = await fetch(`http://localhost:5000/api/users?page=${page}&limit=4`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                // console.log(data, 'lets see dta im')
                const mappedUsers = data.users.map(user => ({
                    id: user._id || Math.random().toString(36).substr(2, 9),
                    name: user.name,
                    age: user.age,
                    location: `${user.location.city}, ${user.location.country}`,
                    height: `${user.height} cm`,
                    zodiac: user.politics || 'Not specified',
                    smoking: user.smoking === 'yes' ? 'Occasionally' : 'Never',
                    gender: user.gender.charAt(0).toUpperCase() + user.gender.slice(1),
                    lookingFor: user.interestedIn === 'everyone' ? 'Something casual' : `Interested in ${user.interestedIn}`,
                    children: user.kids === 'no' ? "Don't want" : user.kids === 'yes' ? 'Want' : 'Maybe',
                    bio: user.bio,
                    images: user.profilePics.length > 0 ? user.profilePics : ['https://via.placeholder.com/512'],
                    interests: user.interests
                }));

                // Replace users array instead of appending to avoid duplicates
                setUsers(mappedUsers);
                setCurrentUserIndex(0); // Reset to first user of new batch

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setFetchingMore(false);
            }
        };

        fetchUsers();
    }, [page]);

    const currentUser = users[currentUserIndex];

    const sendReaction = async (action) => {
        try {
            const response = await fetch('http://localhost:5000/api/userReaction', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetUserId: currentUser.id,
                    action: action
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to send ${action} reaction`);
            }

            console.log(`${action} sent successfully for ${currentUser.name}`);
        } catch (err) {
            console.error(`Error sending ${action}:`, err.message);
            setError(err.message);
        }
    };

    const handleDislike = async () => {
        await sendReaction('dislike');
        moveToNextUser();
    };

    const handleSuperLike = async () => {
        console.log("super like not implemented yet")
    };

    const handleLike = async () => {
        await sendReaction('like');
        moveToNextUser();
    };

    const moveToNextUser = () => {
        // Check if we're at the last user in current batch
        if (currentUserIndex + 1 >= users.length) {
            // Fetch next page - this will trigger useEffect
            setPage(prevPage => prevPage + 1);
            // Don't update currentUserIndex here - let useEffect handle it
        } else {
            // Move to next user in current batch
            setCurrentUserIndex(prevIndex => prevIndex + 1);
        }
    };

    // Show main loading screen on initial load
    if (loading && users.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Finding amazing people for you...</p>
            </div>
        );
    }

    // Show error if no users and there's an error
    if (error && users.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p>Error loading users: {error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    // Show "no more users" if we've exhausted all users
    if (!currentUser && users.length === 0) {
        return (
            <div className={styles.noUsersContainer}>
                <p>No more users available</p>
                <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
        );
    }

    // Show fetching overlay when loading next batch
    if (fetchingMore || !currentUser) {
        return (
            <>
                <DatingAppHeader />
                <div className={styles.bumbleContainer}>
                    <div className={styles.fetchingOverlay}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading more profiles...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <DatingAppHeader />

            {showMatchModal && matchedUser && (
                <div className={styles.matchModal}>
                    <div className={styles.modalContent}>
                        <h2>🎉 It's a Match!</h2>
                        <p>You and <strong>{matchedUser.name}</strong> liked each other!</p>
                        <button
                            className={styles.closeModalButton}
                            onClick={() => {
                                setShowMatchModal(false);
                                setMatchedUser(null);
                                moveToNextUser(); // continue swiping
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.bumbleContainer}>
                <div className={styles.card} ref={cardRef}>
                    <Splide options={{
                        perPage: 1,
                        perMove: 1,
                        direction: 'ttb',
                        height: '75vh',
                        wheel: true,
                        arrows: false,
                        pagination: true,
                        focus: 'center',
                        drag: 'free',
                    }}>
                        <SplideSlide>
                            {/* Profile Image Section */}
                            <div className={styles.item}>
                                <div className={styles.profileHeader}>
                                    <div className={styles.userImage}>
                                        <img src={currentUser.images[0]} alt={`${currentUser.name}'s profile`} />
                                    </div>
                                    <div className={styles.nameSection}>
                                        <div className={styles.nameholder}>
                                            <h2>{currentUser.name}, {currentUser.age}</h2>
                                            <p>{currentUser.location}</p>
                                            <button className={styles.blockButton}>Block and report</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SplideSlide>
                        <SplideSlide>
                            {/* About Section */}
                            <div className={styles.item}>
                                <div className={`${styles.about_details} ${styles.p_20}`}>
                                    <h3>About {currentUser.name}</h3>
                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Height</span>
                                            <span className={styles.detailValue}>{currentUser.height}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Zodiac</span>
                                            <span className={styles.detailValue}>{currentUser.zodiac}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Smoking</span>
                                            <span className={styles.detailValue}>{currentUser.smoking}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Gender</span>
                                            <span className={styles.detailValue}>{currentUser.gender}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Looking for</span>
                                            <span className={styles.detailValue}>{currentUser.lookingFor}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Children</span>
                                            <span className={styles.detailValue}>{currentUser.children}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SplideSlide>
                        <SplideSlide>
                            {/* Bio Section */}
                            <div className={styles.item}>
                                <div className={styles.section}>
                                    <h3>Bio</h3>
                                    <p className={styles.bioText}>{currentUser.bio}</p>
                                </div>
                            </div>
                        </SplideSlide>
                    </Splide>
                </div>

                {/* Action Buttons - Positioned absolutely below the card */}
                <div className={styles.actionButtonsContainer}>
                    <button className={styles.dislikeButton} onClick={handleDislike}>
                        ❌
                    </button>
                    <button className={styles.superLikeButton} onClick={handleSuperLike}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </button>
                    <button className={styles.likeButton} onClick={handleLike}>
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 4.435c-1.989-5.399-12-4.597-12 3.568 0 4.068 3.06 9.481 12 14.997 8.94-5.516 12-10.929 12-14.997 0-8.118-10-8.999-12-3.568z" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default BumblePartnerSelector;