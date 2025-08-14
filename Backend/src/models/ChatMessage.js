import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true },
        seen: { type: Boolean, default: false },
        seenAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
