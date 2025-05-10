import { useState, useRef } from 'react';
import styles from '../styles/BumblePartnerSelector.module.css';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/splide/dist/css/splide.min.css';
import DatingAppHeader from './DatingAppHeader';

const BumblePartnerSelector = () => {
    const [currentUserIndex] = useState(0);
    const cardRef = useRef(null);

    const [users] = useState([
        {
            id: 1,
            name: 'Celine',
            age: 22,
            location: '2km away, Bhaktapur',
            height: '170 cm',
            zodiac: 'Socially',
            smoking: 'Never',
            gender: 'Woman',
            lookingFor: 'Something casual',
            children: 'Don\'t want',
            bio: 'Adventure seeker and coffee lover. Passionate about sustainable living!',
            images: ['https://i.pinimg.com/736x/17/98/c4/1798c43830aec0a130d1de2d843a5f98.jpg']
        }
    ]);

    const currentUser = users[currentUserIndex];

    const handleDislike = () => {
        console.log('Disliked');
        // Add your dislike logic here
    };

    const handleSuperLike = () => {
        console.log('Super Liked');
        // Add your super like logic here
    };


    const handleLike = () => {
        console.log('Liked');
        // Add your like logic here
    };

    return (
       <>
            <DatingAppHeader />
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