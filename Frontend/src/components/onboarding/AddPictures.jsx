import React, { useRef } from 'react';
import styles from '../../styles/Onboarding.module.css';
import { FaPlus } from 'react-icons/fa';

const AddPictures = ({ formData, setFormData, nextStep }) => {
    const { name, photos } = formData;
    const fileInputRef = useRef(null);

    const handleAddPhoto = (e) => {
        const files = Array.from(e.target.files);

        // Allow up to 6 photos only
        const newPhotos = [...photos, ...files].slice(0, 6);

        setFormData(prev => ({
            ...prev,
            photos: newPhotos
        }));
    };

    const triggerFileInput = () => {
        if (photos.length >= 6) return;
        fileInputRef.current.click();
    };

    const handleContinue = () => {
        if (photos.length === 0) {
            alert('Please add at least one photo to continue.');
            return;
        }
        nextStep();
    };

    return (
        <div className={styles.stepContainer}>
            <h2 className={styles.title}>Good Start, {name}</h2>
            <p className={styles.description}>
                In our experience, profiles with 6 images are more popular. Uploading more now will increase your chances!
            </p>

            <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                    <div key={index} className={styles.photoBox}>
                        <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index}`}
                            className={styles.photoPreview}
                        />
                    </div>
                ))}

                {photos.length < 6 && (
                    <div className={styles.photoBox} onClick={triggerFileInput}>
                        <FaPlus className={styles.plusIcon} />
                        <input
                            type="file"
                            accept="image/png"
                            ref={fileInputRef}
                            onChange={handleAddPhoto}
                            hidden
                        />
                    </div>
                )}
            </div>

            <p className={styles.noteText}>
                We accept PNG files that are at least 500 x 500 pixels.
            </p>

            <button className={styles.continueButton} onClick={handleContinue}>
                Continue
            </button>
        </div>
    );
};

export default AddPictures;
