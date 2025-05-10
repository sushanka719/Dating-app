import { useEffect, useState } from 'react';
import styles from '../styles/UploadImages.module.css';

const UploadImages = ({ initialImages, onFilesUpdate }) => {
    // Initialize with 6 null values
    const [images, setImages] = useState(Array(6).fill(null));
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [fileObjects, setFileObjects] = useState(Array(6).fill(null));

    useEffect(() => {
        if (initialImages && Array.isArray(initialImages)) {
            // Create a new array with 6 slots, filling with initialImages first
            const newImages = Array(6).fill(null);
            initialImages.forEach((img, index) => {
                if (index < 6) newImages[index] = img;
            });

            setImages(newImages);
            setFileObjects(Array(6).fill(null)); // Reset file objects
        }
    }, [initialImages]);


    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const updatedImages = [...images];
        const updatedFileObjects = [...fileObjects];
        let filesAdded = 0;

        for (let i = 0; i < newFiles.length && filesAdded < 6; i++) {
            const emptyIndex = updatedImages.findIndex(img => img === null);
            if (emptyIndex !== -1) {
                updatedImages[emptyIndex] = URL.createObjectURL(newFiles[i]);
                updatedFileObjects[emptyIndex] = newFiles[i];
                filesAdded++;
            }
        }

        setImages(updatedImages);
        setFileObjects(updatedFileObjects);
        setUploadModalOpen(false);
        onFilesUpdate(updatedImages, updatedFileObjects);
    };

    const handleSlotClick = (index) => {
        if (images[index]) {
            setPreviewImage(images[index]);
        } else {
            setUploadModalOpen(true);
        }
    };

    const handleDeleteClick = (index) => {
        setDeleteIndex(index);
    };

    const confirmDelete = () => {
        const updatedImages = [...images];
        const updatedFileObjects = [...fileObjects];

        // Revoke the object URL to prevent memory leaks
        if (updatedImages[deleteIndex]?.startsWith('blob:')) {
            URL.revokeObjectURL(updatedImages[deleteIndex]);
        }

        updatedImages[deleteIndex] = null;
        updatedFileObjects[deleteIndex] = null;

        setImages(updatedImages);
        setFileObjects(updatedFileObjects);
        setDeleteIndex(null);

        // Send both arrays to parent
        onFilesUpdate(updatedImages, updatedFileObjects);
    };

    const handleUploadAnother = () => {
        setUploadModalOpen(true);
        setDeleteIndex(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {/* Always render 6 slots */}
                {Array(6).fill(null).map((_, index) => (
                    <div key={index} className={styles.imageWrapper}>
                        {images[index] ? (
                            <>
                                <img
                                    src={images[index]}
                                    alt={`Uploaded ${index}`}
                                    className={styles.image}
                                    onClick={() => handleSlotClick(index)}
                                />
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteClick(index)}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div
                                className={styles.addImage}
                                onClick={() => handleSlotClick(index)}
                            >
                                +
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modals remain the same as your original implementation */}
            {uploadModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setUploadModalOpen(false)}>
                    <div className={styles.uploadModal} onClick={(e) => e.stopPropagation()}>
                        <h2>Upload photos</h2>
                        <p>Adding photos is a great way to show off more about yourself!</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </div>
                </div>
            )}

            {previewImage && (
                <div className={styles.modalOverlay} onClick={() => setPreviewImage(null)}>
                    <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
                        <img src={previewImage} alt="Preview" className={styles.previewImage} />
                    </div>
                </div>
            )}

            {deleteIndex !== null && (
                <div className={styles.modalOverlay} onClick={() => setDeleteIndex(null)}>
                    <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
                        <h2>Are you sure you want to delete your photo?</h2>
                        <div className={styles.deleteButtons}>
                            <button className={styles.uploadAnotherBtn} onClick={handleUploadAnother}>
                                Upload another one
                            </button>
                            <button className={styles.deleteBtn} onClick={confirmDelete}>
                                Delete photo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadImages;