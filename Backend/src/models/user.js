import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        nickName: { type: String},
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 6 },
        age: { type: Number, min: 18 }, 
        interestedIn: { type: String, enum: ["male", "female", "everyone"]},
        lookingfor: { type: String, enum: ["Date", "Bff"]},
        bio: { type: String, maxlength: 250 }, 
        profilePics: [{ type: String }], 
        location: {
            city: { type: String },
            country: { type: String },
            coordinates: { type: { lat: Number, lng: Number } },
        },
        interests: [{ type: String }],
        matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
        blockedList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        preferences: {
            minAge: { type: Number, default: 18 },
            maxAge: { type: Number, default: 60 },
            maxDistance: { type: Number, default: 50 },
        },
        isVerified: { type: Boolean, default: false },
        isOnboarded: { type: Boolean, default: false }, 
        lastActive: { type: Date, default: Date.now }, 
        verificationToken: String,
        verificationTokenExpiresAt: Date,
        snoozeMode: { type: Boolean, default: false },

        //Users dating app details
        gender: { type: String, enum: ["male", "female", "non-binary", "other"] },
        job: { type: String }, 
        education: { type: String }, 
        height: { type: Number },
        drinking: { type: String, enum: ["yes", "no", "occasionally"] },
        smoking: { type: String, enum: ["yes", "no", "occasionally"] },
        kids: { type: String, enum: ["yes", "no", "maybe"] },
        politics: { type: String, enum: ["liberal", "conservative", "moderate", "apolitical"] },
        religion: { type: String },
        currentlyLiving: { type: String },
    },
    { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

export default mongoose.model("User", userSchema);
