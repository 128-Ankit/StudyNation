const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

//-------> resetPasswprdToken
const resetPasswordToken = async (req, res) => {
    try {
        //get email from req body .

        const email = req.body.email;

        //check user for this email, emial validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "Your Email  is not in our database"
            });
        }

        //ganerate token
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000   //expire after 5 min
            },
            { new: true });

        //create url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containig the url
        await mailSender(email,
            "Password Reset Link",
            `Password Reset Link: ${url}`)

        //return response
        return res.json({
            success: true,
            message: 'A link to reset your password has been sent to your email'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Something went worng while sending reset password on email'
        });
    }
};



//-------> resetPassword
const resetPassword = async (req, res) => {
    try {
        //data fetch
        const { password, consfirmPassword, token } = req.body;

        //validation 
        if (password !== consfirmPassword) {
            return res.json({
                success: false,
                message: 'Password and confirm password are not matched'
            });
        }

        //get userdetails from db using token
        const userdetails = await User.findOne({ token: token });

        //if no entry - invalid token
        if (!userdetails) {
            return res.json({
                success: false,
                message: 'Invalid Token'
            });
        }

        //token time check
        if (userdetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: 'Token is expired, plese regenerate your token',
            });
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //password update
        await  User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true },
        );

        //return response
        return res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Somethin wend worng to reset password, please try again'
        });
    }
};

module.exports = {resetPasswordToken, resetPassword};