const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    },

});

// function to send mail
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email from StudyNation", otp);
        console.log("Email sent Successfully: ", mailResponse);
    } catch (error) {
        console.log("erroe occured while sending mails: ", error);
        throw error;

    }
}

otpSchema.pre("save", async function (next) {
    console.log("email is:", this.email);
    console.log("OTP is: ",this.otp)
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", otpSchema);