import express from "express";
import User from "../models/user.js";
import ChatMessage from '../models/ChatMessage.js'

export const getMatches = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("matches", "name profilePics");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Map matches to return only name and first profile pic
        const matches = user.matches.map((match) => ({
            _id: match._id,
            name: match.name,
            profilePic: match.profilePics?.[0] || null,
        }));

        res.status(200).json(matches);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


export const getMatchesWithChats = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Get user and populate matches
        const user = await User.findById(userId).populate("matches", "name profilePics");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Prepare results array
        const results = [];

        for (const match of user.matches) {
            // 3. Get chat messages between user and each match
            const chats = await ChatMessage.find({
                $or: [
                    { sender: userId, receiver: match._id },
                    { sender: match._id, receiver: userId },
                ]
            }).sort({ createdAt: 1 }); // oldest to newest

            // 4. Push match details with chat
            results.push({
                matchId: match._id,
                name: match.name,
                profilePic: match.profilePics?.[0] || null,
                chats: chats.map(chat => ({
                    _id: chat._id,
                    content: chat.content,
                    sender: chat.sender,
                    receiver: chat.receiver,
                    seen: chat.seen,
                    seenAt: chat.seenAt,
                    createdAt: chat.createdAt,
                }))
            });
        }

        res.status(200).json(results);

    } catch (err) {
        console.error("Error in getMatchesWithChats:", err);
        res.status(500).json({ message: "Server error" });
    }
};
