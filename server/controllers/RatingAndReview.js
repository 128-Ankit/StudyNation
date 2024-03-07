const RatingAndReviews = require("../models/RatingAndReviews");
const Course = require('../models/Course');
const { default: mongoose } = require("mongoose");

//-----> createRating
const createRating = async (req, res) => {
    try {
        //get user id
        const userId = req.user.id;

        //fetch data from req body
        const { rating, review, courseId } = req.body;

        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userID } }
            });

        //validation
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the Course',
            })
        }

        //check if user already reviewed the course
        const alreadyReviewed = await RatingAndReviews.findOne({
            user: userId,
            course: courseId,
        });
        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user',
            });
        }

        //create rating and review
        const ratinReviews = await RatingAndReviews.create({
            rating,
            review,
            course: courseId,
            user: userId,
        });

        //update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratinReviews._id,
                }
            },
            { new: true });

        console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success: true,
            message: "Ratind and Review created Successful",
            ratinReviews,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Rating and Review not added, try again",
        });
    }
};

//---------> getAverageRating
const getAverageRating = async (req, res) => {
    try {
        //get course ID
        const courseId = req.body.courseId;

        //calculate avg rating
        const result = await RatingAndReviews.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                }
            }
        ]);

        //return response
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: result[0].averageRating,
            });
        }

        //if no rating/review exist
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no rating given till now",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

//---------> getAllRatingReviews
const getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReviews.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName"
            })
            .exec();

        return res.status(200).json({ 
            success: true,
            message: "All reviews fetched successfully",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {createRating, getAverageRating, getAllRating}