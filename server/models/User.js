const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
    },
    accountType: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
    },
    additinalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        red: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
    ],
    image: {
        type: String,
        required: true,
    },
    token: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    coursesProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "coursesProgress",
        }
    ]
});

module.exports = mongoose.model("User", userSchema);