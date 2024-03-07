const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth");

const {
    login,
    signup,
    sendotp,
    changePassword,
} =  require("../controllers/auth");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");

////    --------> Authentication routes

router.post("/login", login);
router.post("/signup", signup);
router.post("/sendotp", sendotp);
router.post("/changePassword", changePassword);


//// ------->  Reset password
router.post("/reset-password-token", resetPasswordToken);

router.post("/resetPassword", resetPassword);

module.exports = router;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
