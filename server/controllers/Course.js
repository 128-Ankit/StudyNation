const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");


//-------> create course handler function
const createCourse = async (req, res) => {
    try {
        // Upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } = req.body;
        console.log(req.body);
        const thumbnail = req.files.thumbnailImage;
        console.log("thumbnail is: ", thumbnail);

        // Validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        if (!instructorDetails) {
            return res.status(401).json({
                success: false,
                message: 'Instructor account not found'
            });
        }

        // Check if tag exists
        const tagDetails = await Tag.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag Details not found",
            });
        }

        // // Upload Image to Cloudinary
        // const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create a new course entry
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
        });

        // Add the new course to the user schema of the instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            { $push: { courses: newCourse._id } },
            { new: true }
        );

        // Update the TAG schema (TODO)

        // Return response
        return res.status(201).json({
            success: true,
            data: newCourse,
            message: 'New Course Created',
        });
    } catch (error) {
        console.log('Error in create-course:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to Upload"
        });
    }
};

//-----------> getAllCourses handler function
const showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentEnrolled: true,
        })
            .populate("instructor")
            .exec()

        return res.status(200).json({
            seccess: true,
            msg: 'Data for all courses fetched successfully',
            data: allCourses,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Failed To Get Courses"
        });
    }

};

//----------> getCourseDetails
const getCourseDetails = async (req, res) => {
    try {
        //get id
        const { courseId } = req.body;

        //find course detail
        const courseDetails = await Course.find({ _id: courseId }).populate(
            {
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            }
        )
            .populate("category")
            .populate("ratingAndrevies")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        //validation
        if (!courseDetails) {
            return res.status(401).json({
                success: false,
                msg: `No Such Course Found! ${courseId}`,
            });
        }

        //return response
        return res.status(200).json({
            success: true,
            data: courseDetails,
            message: "Successfully fetched the details of the course!",
        });
    } catch (error) {
        console.log(`Error in getCourseDetails : ${error}`);
        return res.status(500).json({
            success: false,
            error: "Server Error!" + error,
        });
    }
};

//-----> getAllCourse
const getAllCourse = async (req, res) => {
    try {
        const pageSize = req.query.pagesize || 10;
        const currentPage = req.query.pageNumber || 1;

        const totalCounts = await Courses.find().countDocuments();

        const courses = await Courses.find()
            .sort([["createdAt", -1]])
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .populate("instructor")
            .exec();

        //Pagination result
        const paginationResults = {
            current: currentPage,
            pageSize: pageSize,
            totalPages: Math.ceil(totalCounts / pageSize),
            totalCount: totalCounts,
        };

        return res.status(200).json({
            success: true,
            data: courses,
            pagination: paginationResults,
        });
    } catch (err) {
        console.log(`Error in getAllCourse: ${err}`);
        return res.status(500).json({
            success: false,
            error: "Server Error!",
        });
    }
};


module.exports = { createCourse, showAllCourses, getCourseDetails, getAllCourse }