import React, { useState } from 'react'
import NameStep from '../components/onboarding/NameStep';
import BirthDate from '../components/onboarding/BirthDate';
import AddGender from '../components/onboarding/AddGender';
import AddPictures from '../components/onboarding/AddPictures';
import LocationAccess from '../components/onboarding/LocationAccess';
import DatingMode from '../components/onboarding/DatingMode';
import { submitOnboarding } from '../store/reducers/UserSlice';
import { useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../store/reducers/authSlice';


const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        gender: '',
        photos: [], // Should be File objects
        location: { city: '', country: '', coordinates: { lat: null, lng: null } },
        datingMode: '',
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();


    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('age', calculateAge(formData.birthdate));
            data.append('gender', formData.gender);
            data.append('interestedIn', formData.datingMode);
            data.append('city', formData.location.city);
            data.append('country', formData.location.country);
            data.append('lat', formData.location.coordinates.lat);
            data.append('lng', formData.location.coordinates.lng);

            formData.photos.forEach(photo => {
                data.append('profilePics', photo);
            });

            // Submit onboarding data
            await dispatch(submitOnboarding(data)).unwrap();

            // Wait until auth state is updated
            await dispatch(checkAuth())

            // Now safely navigate
            navigate('/dating-app');

        } catch (error) {
            console.error("Error submitting onboarding form:", error);
        }
    };


    const renderStep = () => {
        switch (step) {
            case 1:
                return <NameStep formData={formData} setFormData={setFormData} nextStep={nextStep} />;
            case 2:
                return <BirthDate formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
            case 3:
                return <AddGender formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
            case 4:
                return <AddPictures formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
            case 5:
                return <LocationAccess formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />;
            case 6:
                return <DatingMode formData={formData} setFormData={setFormData} prevStep={prevStep} handleSubmit={handleSubmit} />;
            default:
                return null;
        }
    };

    return (
        <div>
            {renderStep()}
        </div>
    );
};

export default Onboarding;

// Helper function
function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const ageDiff = Date.now() - birth.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
}
