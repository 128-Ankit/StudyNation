// import the required modules
const express = require("express");
const router = express.Router();

//import the controllers

//course controllers import
const {
    createCourse,
    getAllCourse,
    getCourseDetails
} = require("../controllers/Course");

//categories controllers import
const {
    showAllCategory,
    createCategory,
    categoryPageDetails,
} = require("../controllers/Category");

// sections controllers import
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

//sub-sections controllers import
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/SubSection");

//Rating controllers import
const {
    createRating,
    getAverageRating,
    getAllRating,
} = require("../controllers/RatingAndReview");

//importing middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

//////--------->  course routes <---------//////////

//courses can only be crated by instructors
router.post("/createCourse", auth, isInstructor, createCourse);

//Add a section to a course
router.post("/addSection", auth, isInstructor, createSection);

//update a section
router.post("/updateSection", auth, isInstructor, updateSection);

//delete a section
router.post("/deleteSection", auth, isInstructor, deleteSection);

//edit a sub-section
router.post("/updateSubSection",auth ,isInstructor, updateSubSection);

// delete a sub-section
router.post("/deleteSubSection",auth ,isInstructor, deleteSubSection);

//add a sub-section a section
router.post("/addSubSection", auth, isInstructor, createSubSection);

///get all ratings of a specific course
router.post("/getAllCourses", getAllCourse);

//get details for a sprecific courses
router.post("/getCourseDetails", getCourseDetails);

router.get("/createCategory", createCategory);
router.get("/showAllCategories", showAllCategory);
router.post("/categoryPageDetails", categoryPageDetails);


//////////////   Rating AND  Review ///////////
router.post("/createRating", auth, isStudent, createRating);
router.post("/getAverageRating", getAverageRating);
router.post("/getAllRating", getAllRating);

module.exports = router;