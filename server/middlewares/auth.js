const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");


//-----> auth
const auth = async (req, res, next) => {
    try {
        //extract token
        const token = req.cookies.token
            || req.body.token
            || req.header("Authorization").replace("Bearer ", "");

        //if token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        //verifying the token 
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch (err) {
            //verification - issue
            console.log("Error Ocuring due to: ",err);
            return res.status(401).json({
                success: false,
                message: "Invalid Token",
            });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            msg: error.message,
            message: "Somthing went worng while validating the token",
        });
    }
};

//---------> isStudent
const isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "You are not a student"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again",
        });
    }
};

//---------> isInstructor
const isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "You are not a Instructor"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again",
        });
    }
};

//---------> isAdmin
const isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "You are not a Admin"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again",
        });
    }
};

module.exports = {auth, isStudent, isInstructor, isAdmin};
