import User from "../models/user.js";
import path from "path";
import fs from "fs/promises";
import getDistanceFromLatLonInKm from "../utils/algorithm.js";
import Report from "../models/report.js"; 
export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        let maxDistance = 50000;

        const currentUserId = req.userId;

        console.log('[DEBUG] Received request for page:', page, 'limit:', limit);

        if (!currentUserId) {
            console.log('[DEBUG] No userId found in request');
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }

        // Include likes, dislikes, and interests in the select
        const currentUser = await User.findById(currentUserId).select(
            'blockedList matches likes dislikes interestedIn preferences location.coordinates interests'
        );

        if (!currentUser) {
            console.log('[DEBUG] Current user not found with id:', currentUserId);
            return res.status(404).json({ message: 'User not found' });
        }

        if (!currentUser.location?.coordinates?.lat || !currentUser.location?.coordinates?.lng) {
            console.log('[DEBUG] Current user location not set or incomplete:', currentUser.location);
            return res.status(400).json({ message: 'User location not set' });
        }

        // Create array of all users to exclude (blocked, matched, liked, disliked)
        const excludedUserIds = [
            ...(currentUser.blockedList || []),
            ...(currentUser.matches || []),
            ...(currentUser.likes || []),
            ...(currentUser.dislikes || [])
        ];

        console.log('[DEBUG] Total excluded user IDs:', excludedUserIds.length);

        const query = {
            _id: {
                $ne: currentUserId,
                $nin: excludedUserIds
            },
            snoozeMode: false,
            'location.coordinates': { $exists: true },
            interests: { $exists: true, $ne: [] } // Ensure users have interests
        };

        if (currentUser.interestedIn && currentUser.interestedIn !== 'everyone') {
            query.gender = currentUser.interestedIn;
        }

        if (currentUser.preferences?.minAge || currentUser.preferences?.maxAge) {
            query.age = {};
            if (currentUser.preferences?.minAge) {
                query.age.$gte = currentUser.preferences.minAge;
            }
            if (currentUser.preferences?.maxAge) {
                query.age.$lte = currentUser.preferences.maxAge;
            }
        }

        console.log('[DEBUG] Query to fetch users:', JSON.stringify(query));

        // Fetch all users matching initial criteria
        const allUsers = await User.find(query)
            .select(
                '-password -verificationToken -verificationTokenExpiresAt -snoozeMode -isOnboarded -matches -likes -dislikes -blockedList -email -isVerified -lookingfor -preferences'
            )
            .exec();

        console.log('[DEBUG] Total users matching initial query (after exclusions):', allUsers.length);

        // Filter users by distance and calculate interest compatibility
        const currentLat = currentUser.location.coordinates.lat;
        const currentLng = currentUser.location.coordinates.lng;
        const currentInterests = currentUser.interests || [];

        const nearbyUsersWithScores = allUsers
            .map(user => {
                const userLat = user.location?.coordinates?.lat;
                const userLng = user.location?.coordinates?.lng;
                if (!userLat || !userLng) return null;

                const distance = getDistanceFromLatLonInKm(
                    currentLat,
                    currentLng,
                    userLat,
                    userLng
                );

                // Calculate interest compatibility score
                const userInterests = user.interests || [];
                const commonInterests = currentInterests.filter(interest =>
                    userInterests.includes(interest)
                );
                const compatibilityScore = commonInterests.length / Math.max(currentInterests.length, 1);

                console.log(
                    `[DEBUG] User ${user._id} distance: ${distance} km, common interests: ${commonInterests.length}, score: ${compatibilityScore}`
                );

                return {
                    user,
                    distance,
                    compatibilityScore,
                    commonInterests
                };
            })
            .filter(item => item && item.distance <= Number(maxDistance));

        console.log('[DEBUG] Users within maxDistance:', nearbyUsersWithScores.length);

        // Sort users by compatibility score (descending) and then by distance (ascending)
        nearbyUsersWithScores.sort((a, b) => {
            if (b.compatibilityScore !== a.compatibilityScore) {
                return b.compatibilityScore - a.compatibilityScore;
            }
            return a.distance - b.distance;
        });

        // Apply pagination to sorted results
        const paginatedUsers = nearbyUsersWithScores
            .slice((page - 1) * limit, page * limit)
            .map(item => ({
                ...item.user.toObject(),
                commonInterests: item.commonInterests,
                compatibilityScore: item.compatibilityScore
            }));

        res.status(200).json({
            users: paginatedUsers,
            total: nearbyUsersWithScores.length,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('[ERROR]', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

export const reactToUser = async (req, res) => {
    console.log('reaction api hit');
    const { targetUserId, action } = req.body;
    const currentUser = await User.findById(req.userId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
    }

    let isMatched = false;

    // Handle the like action
    if (action === "like") {
        if (!currentUser.likes.includes(targetUserId)) {
            currentUser.likes.push(targetUserId);
        }
        currentUser.dislikes = currentUser.dislikes.filter(id => id.toString() !== targetUserId);
        currentUser.blockedList = currentUser.blockedList.filter(id => id.toString() !== targetUserId);

        // Check if mutual like exists (i.e., it's a match)
        if (targetUser.likes.includes(req.userId)) {
            isMatched = true;

            // Add both users to each other's matches array if not already present
            if (!currentUser.matches.includes(targetUserId)) {
                currentUser.matches.push(targetUserId);
            }
            if (!targetUser.matches.includes(req.userId)) {
                targetUser.matches.push(req.userId);
            }
        }
    }
    // Handle the dislike action
    else if (action === "dislike") {
        if (!currentUser.dislikes.includes(targetUserId)) {
            currentUser.dislikes.push(targetUserId);
        }
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== targetUserId);
        currentUser.blockedList = currentUser.blockedList.filter(id => id.toString() !== targetUserId);
    }
    // Handle the block action
    else if (action === "block") {
        if (!currentUser.blockedList.includes(targetUserId)) {
            currentUser.blockedList.push(targetUserId);
        }
        currentUser.likes = currentUser.likes.filter(id => id.toString() !== targetUserId);
        currentUser.dislikes = currentUser.dislikes.filter(id => id.toString() !== targetUserId);
    }
    // Invalid action type
    else {
        return res.status(400).json({ message: "Invalid action type" });
    }

    // Save both users if a match occurred (to update matches array for both)
    await currentUser.save();
    if (isMatched) {
        await targetUser.save();
    }

    return res.status(200).json({
        message: `User ${action}d successfully`,
        isMatched // Send boolean flag to frontend
    });
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
        const userId = req.userId; 
        // console.log("Updating profile for user ID:", userId);

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
            // console.log('Updated profile pictures:', user.profilePics);
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
        const userId = req.userId; 
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
        const userId = req.userId; 

        const {
            snoozeMode,
            interestedIn,
            lookingfor, 
            preferences
        } = req.body;

        console.log(snoozeMode, interestedIn, preferences, lookingfor)

        const updateData = {};

        if (typeof snoozeMode === "boolean") {
            updateData.snoozeMode = snoozeMode;
        }

        if (interestedIn) {
            updateData.interestedIn = interestedIn.toLowerCase();
        }

        if (lookingfor) {
            updateData.lookingfor = lookingfor;
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
export const getAdminDashboardStats = async (req, res) => {
    try {
        // Ensure the requester is an admin
        const adminUser = await User.findById(req.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        // Fetch statistics
        const totalUsers = await User.countDocuments();
        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
        });
        const onboardedUsers = await User.countDocuments({ isOnboarded: true });
        const snoozedUsers = await User.countDocuments({ snoozeMode: true });

        const stats = {
            totalUsers,
            verifiedUsers,
            activeUsers,
            onboardedUsers,
            snoozedUsers
        };

        console.log('[DEBUG] Admin stats:', stats);

        res.status(200).json({
            success: true,
            message: "Statistics fetched successfully",
            stats
        });
    } catch (error) {
        console.error('[ERROR] Fetching admin stats:', error);
        res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
    }
};

export const getAdminUserList = async (req, res) => {
    try {
        // Ensure the requester is an admin
        const adminUser = await User.findById(req.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { page = 1, limit = 10 } = req.query;

        console.log('[DEBUG] Received request for user list - page:', page, 'limit:', limit);

        const users = await User.find()
            .select('name email age gender location isVerified isOnboarded lastActive matches')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await User.countDocuments();

        console.log('[DEBUG] Fetched users:', users.length, 'Total:', total);

        res.status(200).json({
            success: true,
            message: "User list fetched successfully",
            users,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('[ERROR] Fetching user list:', error);
        res.status(500).json({ message: "Failed to fetch user list", error: error.message });
    }
};

export const getAdminReports = async (req, res) => {
    try {
        // Ensure the requester is an admin
        const adminUser = await User.findById(req.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { page = 1, limit = 10 } = req.query;

        console.log('[DEBUG] Received request for reports - page:', page, 'limit:', limit);

        // Assuming a Report model with fields matching the frontend
        const reports = await Report.find()
            .select('reportId reportedUser reportedBy severity issue status reportedAt')
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Report.countDocuments();

        console.log('[DEBUG] Fetched reports:', reports.length, 'Total:', total);

        res.status(200).json({
            success: true,
            message: "Reports fetched successfully",
            reports,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('[ERROR] Fetching reports:', error);
        res.status(500).json({ message: "Failed to fetch reports", error: error.message });
    }
};

export const updateReportStatus = async (req, res) => {
    try {
        // Ensure the requester is an admin
        const adminUser = await User.findById(req.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { reportId, status } = req.body;

        if (!reportId || !status) {
            return res.status(400).json({ message: "Report ID and status are required" });
        }

        const validStatuses = ['Pending', 'Under Review', 'Resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        console.log('[DEBUG] Updating report:', reportId, 'to status:', status);

        const report = await Report.findOneAndUpdate(
            { reportId },
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({
            success: true,
            message: "Report status updated successfully",
            report
        });
    } catch (error) {
        console.error('[ERROR] Updating report status:', error);
        res.status(500).json({ message: "Failed to update report status", error: error.message });
    }
};

export const suspendUser = async (req, res) => {
    try {
        // Ensure the requester is an admin
        const adminUser = await User.findById(req.userId);
        if (!adminUser || !adminUser.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: Admin access required" });
        }

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        console.log('[DEBUG] Suspending user:', userId);

        const user = await User.findByIdAndUpdate(
            userId,
            { snoozeMode: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "User suspended successfully",
            user
        });
    } catch (error) {
        console.error('[ERROR] Suspending user:', error);
        res.status(500).json({ message: "Failed to suspend user", error: error.message });
    }
};