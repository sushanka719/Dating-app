import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import bcryptjs from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateVerificationCode.js';
import { sendVerificationEmail } from '../utils/email.js';

export const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Verification code is required" });
    }

    try {
        // Find user by token (check expiration)
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiresAt: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired verification code" });
        }

        // Mark as verified and clear token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // Respond with success (NO JWT COOKIE SET HERE)
        res.json({
            success: true,
            message: "Email verified successfully! Please log in.",
            user: {
                _id: user._id,
                email: user.email,
                isVerified: true
            }
        });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Validations (unchanged)
        if (!email || !password || !name) throw new Error("All fields are required");
        const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
        if (!emailRegex.test(email)) throw new Error("Invalid email format. Use a Gmail address.");
        if (name.length < 3 || name.length > 20) throw new Error("Username must be 3-20 characters.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");

        // Check if user exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password and generate token
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user (isVerified: false by default)
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        await user.save();

        // Send verification email (NO JWT cookie set here)
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "Verification email sent. Check your inbox.",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    try {
        if (!email || !password) throw new Error("Email and password are required");

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Reject if email not verified
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first. Check your inbox."
            });
        }

        // Set JWT cookie and update lastActive
        generateTokenAndSetCookie(res, user._id);
        user.lastActive = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                isOnboarded: user.isOnboarded
            }
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Optionally pick specific fields to send
        const { _id, name, email, isOnboarded, gender, age, isVerified } = user;

        res.status(200).json({
            success: true,
            user: {
                _id,
                name,
                email,
                isOnboarded,
                gender,
                age,
                isVerified
            }
        });
    } catch (error) {
        console.error("Error in checkAuth: ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

