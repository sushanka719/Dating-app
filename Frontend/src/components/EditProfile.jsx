import React, { useState, useEffect } from 'react'
import Accordion from '../components/Accordion.jsx'
import MenuNavBar from './MenuNavBar.jsx'
import UploadImages from './UploadImages.jsx'
import styles from '../styles/EditProfile.module.css'
import kiss from '../assets/kiss.png';
import { useOutletContext } from 'react-router-dom'
import { interests } from '../utils/interests.js'
import { useDispatch } from 'react-redux'
import { submitUserData } from '../store/reducers/updateProfile.js'

const EditProfile = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { setOption } = useOutletContext();
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState({
    job: '',
    education: '',
    height: '',
    drinking: '',
    smoking: '',
    kids: '',
    politics: '',
    religion: '',
    location: '',
    bio: '',
  });

  // File state - tracks both preview URLs and actual File objects
  const [files, setFiles] = useState({
    previewUrls: Array(6).fill(null),
    fileObjects: Array(6).fill(null)
  });

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = interests.filter(interest =>
        interest.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedInterests.includes(interest)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [inputValue, selectedInterests]);

  // Fetch user data once on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          credentials: 'include'
        });
        const data = await res.json();

        setFormData({
          job: data.user.job || '',
          education: data.user.education || '',
          height: data.user.height || '',
          drinking: data.user.drinking || '',
          smoking: data.user.smoking || '',
          kids: data.user.kids || '',
          politics: data.user.politics || '',
          religion: data.user.religion || '',
          location: data.user.currentlyLiving || '',
          bio: data.user.bio || '',
        });

        setSelectedInterests(data.user.interests || []);

        // Set image previews with full URLs
        const previewUrls = data.user.profilePics?.map(pic => `http://localhost:5000${pic}`) || Array(6).fill(null);
        setFiles({
          previewUrls,
          fileObjects: Array(6).fill(null),
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Update files state when UploadImages component calls back
  const handleFilesUpdate = (updatedPreviewUrls, updatedFileObjects) => {
    setFiles({
      previewUrls: updatedPreviewUrls,
      fileObjects: updatedFileObjects
    });
  };

  const handleAddInterest = (interest) => {
    if (interest && !selectedInterests.includes(interest)) {
      setSelectedInterests([...selectedInterests, interest]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setSelectedInterests(selectedInterests.filter(interest => interest !== interestToRemove));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Append normal form data if non-empty
    Object.entries(formData).forEach(([key, value]) => {
      const stringValue = String(value);
      if (stringValue.trim() !== "") {
        formDataToSend.append(key, stringValue);
      }
    });

    // Append interests (can be multiple)
    selectedInterests.forEach(interest => {
      formDataToSend.append('interests', interest);
    });

    // Append files:
    // - New uploads as files
    // - Existing images as paths (without base URL)
    files.previewUrls.forEach((url, index) => {
      const file = files.fileObjects[index];
      if (file) {
        formDataToSend.append('profilePics', file);
      } else if (url) {
        const imagePath = url.replace('http://localhost:5000', '');
        formDataToSend.append('existingProfilePics', imagePath);
      }
      // Null means deleted image — do not append anything
    });

    // Debug log the formData contents
    const formDataObject = {};
    for (let [key, value] of formDataToSend.entries()) {
      if (formDataObject[key]) {
        if (Array.isArray(formDataObject[key])) {
          formDataObject[key].push(value);
        } else {
          formDataObject[key] = [formDataObject[key], value];
        }
      } else {
        formDataObject[key] = value;
      }
    }
    console.log('Submitting:', formDataObject);

    // Dispatch to redux thunk
    dispatch(submitUserData(formDataToSend));
  };

  return (
    <>
      <MenuNavBar title={"Edit Profile"} setOption={setOption} />
      <div className={styles.container}>
        <UploadImages
          initialImages={files.previewUrls}
          initialFileObjects={files.fileObjects}
          onFilesUpdate={handleFilesUpdate}
        />


        <Accordion title={"Add bio"}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              name="bio"
              onChange={handleInputChange}
              maxLength='250'
              placeholder="Write something about yourself..."
              className={styles.textarea}
              value={formData.bio}
            />
            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Save
              </button>
            </div>
          </form>
        </Accordion>

        <Accordion title={"My Work & Education"}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.row}>
              <input
                type="text"
                name="job"
                onChange={handleInputChange}
                placeholder="Add your job"
                pattern="[A-Za-z\s]+"
                title="job can only contain letters and spaces"
                className={styles.inputLeft}
              />
              <p className={styles.dataRight}>{formData.job}</p>
            </div>

            <div className={styles.row}>
              <input
                type="text"
                name="education"
                onChange={handleInputChange}
                placeholder="Add your education"
                className={styles.inputLeft}
                value={formData.education}
                pattern="[A-Za-z\s]+"
                title="Education can only contain letters and spaces"
              />
              <p className={styles.dataRight}>{formData.education}</p>
            </div>

            <div className={styles.row}>
              <input
                type="number"
                name="height"
                onChange={handleInputChange}
                placeholder="Your height in cm"
                className={styles.inputLeft}
              />
              <p className={styles.dataRight}>{formData.height} cm</p>
            </div>

            <div className={styles.row}>
              <select
                name="drinking"
                onChange={handleInputChange}
                className={styles.inputLeft}
              >
                <option value="">Drinking habits</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
              </select>
              <p className={styles.dataRight}>{formData.drinking}</p>
            </div>

            <div className={styles.row}>
              <select
                name="smoking"
                onChange={handleInputChange}
                className={styles.inputLeft}
              >
                <option value="">Smoking habits</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
              </select>
              <p className={styles.dataRight}>{formData.smoking}</p>
            </div>

            <div className={styles.row}>
              <select
                name="kids"
                onChange={handleInputChange}
                className={styles.inputLeft}
              >
                <option value="">Do you want kids?</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
              <p className={styles.dataRight}>{formData.kids}</p>
            </div>

            <div className={styles.row}>
              <select
                name="politics"
                onChange={handleInputChange}
                className={styles.inputLeft}
              >
                <option value="">Political views</option>
                <option value="liberal">Liberal</option>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="apolitical">Apolitical</option>
              </select>
              <p className={styles.dataRight}>{formData.politics}</p>
            </div>

            <div className={styles.row}>
              <input
                type="text"
                name="religion"
                onChange={handleInputChange}
                placeholder="Add your religion"
                className={styles.inputLeft}
                pattern="[A-Za-z\s]+"
                title="religion can only contain letters and spaces"
              />
              <p className={styles.dataRight}>{formData.religion}</p>
            </div>

            <div className={styles.row}>
              <input
                type="text"
                name="location"
                onChange={handleInputChange}
                placeholder="Add places you lived"
                className={styles.inputLeft}
                pattern="[A-Za-z\s]+"
                title="location can only contain letters and spaces"
              />
              <p className={styles.dataRight}>{formData.location}</p>
            </div>

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Save
              </button>
            </div>
          </form>
        </Accordion>

        <Accordion title={"Interests and Hobbies"}>
          <div className={styles.interestsContainer}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Search interests..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={styles.inputInterest}
              />
            </div>

            {suggestions.length > 0 && (
              <div className={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleAddInterest(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.interestsList}>
              {selectedInterests.map((interest, index) => (
                <div key={index} className={styles.chip}>
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Accordion>
        <div className={styles.footer}>
          <img src={kiss} alt="icon" className={styles.kissIcon} />
          <div className={styles.appName}>MingleMe</div>
          <div className={styles.creator}>Created with ❤️</div>
        </div>
      </div>
    </>
  )
}

export default EditProfile;