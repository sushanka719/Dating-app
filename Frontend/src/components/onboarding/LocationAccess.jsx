import React from 'react';
import styles from '../../styles/Onboarding.module.css';
import locationIcon from '../../assets/placeholder.png';
import axios from 'axios';

const LocationAccess = ({ nextStep, formData, setFormData }) => {
  const handleAllow = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding using OpenStreetMap's Nominatim API (free & open)
            const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
              params: {
                format: 'jsonv2',
                lat: latitude,
                lon: longitude,
              },
              headers: {
                'User-Agent': 'MingleMeApp/1.0 (your_email@example.com)',
              },
            });

            const address = res.data.address;
            console.log('Full address:', address);

            const city =
              address.city ||
              address.town ||
              address.village ||
              address.hamlet ||
              address.municipality ||
              address.locality ||
              '';
              console.log(city)
            const country = address.country || '';

            // Update parent formData
            setFormData({
              ...formData,
              location: {
                city,
                country,
                coordinates: {
                  lat: latitude,
                  lng: longitude,
                },
              },
            });

            nextStep(); // proceed after location access
          } catch (err) {
            alert('Failed to fetch location details.');
          }
        },
        () => {
          alert('Location access denied or failed.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className={styles.stepContainer}>
      <img src={locationIcon} alt="Location Icon" className={styles.locationImage} />

      <h2 className={styles.title}>We need your location</h2>
      <p className={styles.description}>
        To show people nearby, you will need to grant <strong>MingleMe</strong> access to your location.
      </p>

      <button className={styles.continueButton} onClick={handleAllow}>
        Allow Access
      </button>
    </div>
  );
};

export default LocationAccess;
