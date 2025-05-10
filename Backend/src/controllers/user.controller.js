import User from "../models/user.js";
import path from "path";
import fs from "fs/promises";


export const getUsers = async (req, res) => {
    // add a funcitonality to skip blocked users from showing in feed
    // important
    try {
        const { page = 1, limit = 10 } = req.query;

        //fetch users with pagination
        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .select('-password')
            .exec();

        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
}


export const reactToUser = async (req, res) => {
    const { targetUserId, action } = req.body;
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
        return res.status(404).json({ message: "Current user not found" });
    }

    // Handle the like action
    if (action === "like") {
        if (!currentUser.likes.includes(targetUserId)) {
            currentUser.likes.push(targetUserId);
        }
        currentUser.dislikes = currentUser.dislikes.filter(id => id.toString() !== targetUserId);
        currentUser.blockedList = currentUser.blockedList.filter(id => id.toString() !== targetUserId); // Remove from blocked list if previously blocked
    }
    // Handle the dislike action
    else if (action === "dislike") {
        if (!currentUser.dislikes.includes(targetUserId)) {
            currentUser.dislikes.push(targetUserId);
        }
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== targetUserId);
        currentUser.blockedList = currentUser.blockedList.filter(id => id.toString() !== targetUserId); // Remove from blocked list if previously blocked
    }
    // Handle the block action
    else if (action === "block") {
        if (!currentUser.blockedList.includes(targetUserId)) {
            currentUser.blockedList.push(targetUserId); // Add to blocked list
        }

        // Remove from likes and dislikes if the user is being blocked
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== targetUserId);
        currentUser.dislikes = currentUser.dislikes.filter(id => id.toString() !== targetUserId);
    }
    // Invalid action type
    else {
        return res.status(400).json({ message: "Invalid action type" });
    }

    await currentUser.save();
    return res.status(200).json({ message: `User ${action}d successfully` });
};

export const updateBasicProfileAndLocation = async (req, res) => {
    const {
        name,
        age,
        gender,
        interestedIn,
        city,
        country
    } = req.body;

    // Parse coordinates safely from form-data (like coordinates.lat and coordinates.lng)
    const lat = parseFloat(req.body['coordinates.lat'] || req.body.lat);
    const lng = parseFloat(req.body['coordinates.lng'] || req.body.lng);

    // Debugging logs (optional)
    console.log('Received:', { name, age, gender, interestedIn, city, country, lat, lng });

    // Validate required fields
    const errors = [];
    if (!name) errors.push("name is required");
    if (!age || isNaN(parseInt(age))) errors.push("valid age is required");
    if (!gender) errors.push("gender is required");
    if (!interestedIn) errors.push("interestedIn is required");
    if (!city) errors.push("city is required");
    if (!country) errors.push("country is required");
    if (isNaN(lat) || isNaN(lng)) errors.push("coordinates with valid lat and lng are required");

    console.log(errors)

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.nickName = name;
        user.age = parseInt(age);
        user.gender = gender;
        user.lookingfor = interestedIn;
        user.isOnboarded = true;
        user.location = { city, country, coordinates: { lat, lng } };

        // Handle image uploads
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
            user.profilePics = imagePaths;
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });

    } catch (error) {
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId; // from JWT middleware
        console.log("Updating profile for user ID:", userId);

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Normalize and update text fields (single-value)
        const singleFields = [
            "height", "drinking", "smoking", "kids", "politics", "bio", "gender", "lookingfor", "interestedIn"
        ];
        singleFields.forEach(field => {
            if (req.body[field] !== undefined) {
                console.log(`${field}:`, req.body[field]);
                user[field] = req.body[field].toLowerCase?.() || req.body[field];
            }
        });

        // Handle 'job' (string)
        if (req.body.job) {
            const job = req.body.job.trim();  // Trim any extra spaces
            console.log("job:", job);
            user.job = job;  // Save it directly as a string
        }

        // Handle 'education' (string)
        if (req.body.education) {
            const education = req.body.education.trim();  // Trim any extra spaces
            console.log("education:", education);
            user.education = education;  // Save it directly as a string
        }

        // Handle 'religion' (string)
        if (req.body.religion) {
            const religion = req.body.religion.trim().toLowerCase();  // Trim and convert to lowercase
            console.log("religion:", religion);
            user.religion = religion;  // Save it directly as a string
        }

        // Handle 'places' (array)
        if (req.body.places) {
            const places = Array.isArray(req.body.places)
                ? req.body.places.map(p => p.trim())
                : req.body.places.split(",").map(p => p.trim());
            console.log("places:", places);
            user.places = places;
        }

        // Handle 'interests' (array)
        if (req.body.interests) {
            const interests = Array.isArray(req.body.interests)
                ? req.body.interests.map(i => i.trim())
                : req.body.interests.split(",").map(i => i.trim());
            console.log("interests:", interests);
            user.interests = interests;
        }

        // Handle 'currentlyLiving' (array)
        if (req.body.location) {
            const currentlyLiving = req.body.location;
            user.currentlyLiving = currentlyLiving;
        }

        // Handle profile pictures
        if (req.files || req.body.existingProfilePics) {
            console.log("Processing profile pictures update...");

            // Process existing images (sent from frontend as paths)
            const existingPics = [];
            if (req.body.existingProfilePics) {
                existingPics.push(...(
                    Array.isArray(req.body.existingProfilePics)
                        ? req.body.existingProfilePics
                        : [req.body.existingProfilePics]
                ).filter(Boolean));
            }

            // Process new uploads
            const newPics = req.files?.map(file => `/uploads/${file.filename}`) || [];

            // Combine existing and new pics (up to 6 total)
            const updatedProfilePics = [...existingPics, ...newPics].slice(0, 6);

            // Determine which images were deleted
            const oldPics = user.profilePics || [];
            const deletedPics = oldPics.filter(pic =>
                pic && !updatedProfilePics.includes(pic)
            );

            // Delete removed images from filesystem
            for (const pic of deletedPics) {
                const filePath = path.join('public', pic);
                try {
                    await fs.unlink(filePath);
                    console.log('Deleted old image:', filePath);
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.error('Error deleting image:', err);
                    }
                }
            }

            // Update user's profile pictures
            user.profilePics = updatedProfilePics;
            console.log('Updated profile pictures:', user.profilePics);
        }

        await user.save();

        console.log("Profile updated successfully for user:", userId);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // from JWT middleware
        const user = await User.findById(userId)
            .select('-password -email -verificationToken -verificationTokenExpiresAt -blockedList -matches -likes -dislikes -isVerified -isOnboarded');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const updateUserSettings = async (req, res) => {
    try {
        const userId = req.userId; // Assumes you have auth middleware that sets req.user

        const {
            snoozeMode,
            interestedIn,
            lookingfor, // maps to 'lookingfor'
            preferences
        } = req.body;

        console.log(snoozeMode, interestedIn, preferences, lookingfor)

        // Build the update object safely
        const updateData = {};

        if (typeof snoozeMode === "boolean") {
            updateData.snoozeMode = snoozeMode;
        }

        if (interestedIn) {
            updateData.interestedIn = interestedIn.toLowerCase();
        }

        if (lookingfor) {
            updateData.lookingfor = lookingfor.toLowerCase();
        }

        if (preferences && typeof preferences === 'object') {
            updateData["preferences.minAge"] = preferences.minAge;
            updateData["preferences.maxAge"] = preferences.maxAge;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        });

        res.status(200).json({
            message: "Settings updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user settings:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};