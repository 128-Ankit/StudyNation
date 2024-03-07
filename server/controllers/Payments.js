const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//----> capture payment and initiate the Razorpay order
const capturePayment = async (req, res) => {
    //get couseId and UserId
    const { course_id } = req.body;
    const userId = req.user.id;

    //validation
    //valid courseID
    if (!course_id) {
        return res.json({
            success: false,
            message: "Please provide a valid course ID.",
        });
    };

    //valid courseDetail
    let course;
    try {
        course = await Course.findById(course_id)
        if (!course) {
            return res.json({
                success: false,
                message: 'Course not  found.',
            });
        }

        //user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: 'Student is already enrolled'
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

    //order create
    const amount = course.price;
    const currency = "INR";

    const option = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    try {
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(option);
        console.log(paymentResponse);

        //return response
        return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Could not initiate order",
        });
    }
};

//------> verify signature of Razorpay and server
const verifySignature = async (req, res) => {
    const webhookSecret = "12345678";

    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("shaz56", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digit = shasum.digit("hex");

    if (!signature === digit) {
        console.log("Payment is Authorised");

        const { courseId, userId } = req.body.payload.payment.entity.notes;

        try {
            //fulfil the action

            //find the course and enroll the student in it
            const enrolledCoures = await Course.findOneAndUpdate({ _id: courseId },
                { $push: { studentEnrolled: userId } },
                { new: true }
            );

            if (!enrolledCoures) {
                return res.status(404).json({
                    succcess: false,
                    message: "course doesnot exist"
                });
            }
            console.log(enrolledCoures);

            //find the student and add the course to their list enrolled  courses
            const enrolledStudent = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { course: courseId } },
                { new: true },
            );

            console.log(enrolledStudent);

            //mail send krdo confirmation wala
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Your are successfully Enrolled into a course!",
                "Congratulations, you are onboarded into new StudyNotaion Course",
            );

            console.log(emailResponse);
            return res.status(201).json({
                success: true,
                message: 'Payment is successful',
            });
        } catch (error) {
            console.log(error, "Error occured");
            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }
    else {
        return res.status(403).json({
            succcess: false,
            message: "Invalid request",
        });
    }
};

module.exports = {capturePayment, verifySignature};