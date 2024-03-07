const bcrypt = require('bcrypt');
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require('jsonwebtoken');
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require('dotenv').config();

//--------> send Otp
const sendotp = async (req, res) => {
    try {
        // fetch email from request body
        const { email } = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({ email });

        //if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already  exists',
            })
        }

        //generate otp..user not exist if
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);

        //check unique otp or not
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        //create an entry for OTP in DB
        const otpBody = await OTP.create(new OTP(otpPayload));
        console.log(otpPayload);

        //return response successful
        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
            otp,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//--------> signup constroller for registering users
const signup = async (req, res) => {

    try {
        //data fetch from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //check if all details are there or not
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "Fields can't be empty"
            });
        }

        //match 2 password 
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        //check user already exist or not
        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already in used. or user already exist"
            });
        }

        //find most recent  OTP and compare with the provided one
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //validate otp
        if (recentOtp.length == 0) {
            //OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP Not Found"
            });
        } else if (otp !== recentOtp.otp) {
            //Invalid otp
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in DB

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additinalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //return response
        return res.status(200).json({
            success: true,
            message: 'User Created Successfully',
            user,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User can not be registerd, please try again",
        });

    }
};

//---------> Login
const login = async (req, res) => {
    try {
        //get data from req body
        let { email, password } = req.body;

        //validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        //user check exist or not
        const user = await User.findOne({ email }).populate('additinalDetails');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Registered, Please signup first."
            });
        }

        //generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({
                email: user.email,
                id: user._id,
                accountType: user.accountType
            },
                process.env.JWT_SECRET, {
                expiresIn: "2h",
            });

            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options = {
                expire: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                messege: "Logged in successfully",
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            });
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
};

//---------> changePassword
const changePassword = async (req, res) => {
    try {
        // Get data from request body
        const { email, oldPassword, newPassword } = req.body;

        // Validate if all required fields are present
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid old password"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Send response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to update password"
        });
    }
};

module.exports = { sendotp, signup, login, changePassword };