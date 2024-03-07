const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth");

const {
    deleteAccount,
    updateProfile,
    updateDisplayPicture,
    getAllUserDetails,
    getEnrolledCourses,
} = require("../controllers/Profile");

// updateDisplayPicture,
/////////////---------> Profile routes <--------/////////////
// Delete user account
router.delete("/deleteProfile", auth, deleteAccount); 
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)

//get enrolled courses
router.get("/getEnrolledCourse", auth, getEnrolledCourses)
router.get("/updateDisplayPicture", auth, updateDisplayPicture)

module.exports = router;