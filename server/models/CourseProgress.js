const mongoose = require("mongoose");

const courseProgress = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObectId,
        ref: "Course",
    },
    complitedVideos: [
        {
            type: mongoose.Schema.Types.ObectId,
            ref: "SubSection",
        }
    ]

});

module.exports = mongoose.model("CourseProgress", courseProgress);