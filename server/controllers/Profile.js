const Profile = require("../models/Profile");
const User = require("../models/User");

//-------> getEnrolledCourses
const getEnrolledCourses = async (req, res) => {
    const userId = req.userData.id;
    try {
        const user = await User.findById(userId).populate({
            path: "enrollments",
            match: { status: 'ENROLLED' },
            populate: {
                path: "course"
            }
        });

        if (!user) {
            return res.status(401).json({ msg: 'No user found' })
        }
        // Sending back the enrolled courses of the logged in user
        console.log('User Enrolled Courses', user.enrollments);
        res.status(200).json(user.enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    };
};
 
//------> update profile
const updateProfile = async (req, res) => {
    try {
        //get data 
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if (!contactNumber || !gender || !id)
            return res.status(400).json({
                success: false,
                msg: "Please fill out all fields"
            });

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additinalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        profileDetails.gender = gender;

        //return response
        return res.status(201).json({
            success: true,
            profileDetails,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error!"
        });
    }
}

//------> delete Account
const deleteAccount = async (req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if (!userDetails)
            return res.status(400).json({
                success: false,
                msg: "User not found"
            });

        //delete profile
        await Profile.findByIdAndDelete({ _id: userDetails.additinalDetails });

        //delete user
        await User.findOneAndDelete({ _id: id });

        //return response
        return res.status(200).json({
            success: true,
            message: "User deleted Successfully!",
        });

        //TODO: HW uneneroll user from all enrolled courses or finally remove the user account
        
        await User.findOneAndRemove({ _id: id }).exec();

        return res.status(200).json({
            success: true,
            data: [],
            msg: "Account has been deleted Successfully."
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User can not be deleted successfully',
        });
    }
};

//------> to get all user details
const getAllUserDetails = async (req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate('additinalDetails').exec();

        //return response
        return res.status(200).json({
            success: true,
            message: 'Getting the user information was successful',
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//------> updateDisplayPicture
const updateDisplayPicture = async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            console.log("req.file got: ",req.file);
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Get file path
        let imgPath = req.file.path;
        console,log("image path is: ", imgPath);
        // Update in database
        const userId = req.user.id;
        const updatedUser = await User.findByIdAndUpdate(userId, { displayPicture: imgPath }, { new: true });

        // Send response
        return res.status(200).json({
            success: true,
            data: updatedUser,
            message: "The image has been uploaded successfully"
        });

    } catch (err) {
        console.log("Unable to update picture:", err);
        return res.status(400).json({
            success: false,
            message: "Unable to update picture",
            error: err.message
        });
    }
};


module.exports = { getEnrolledCourses, getAllUserDetails, deleteAccount, updateProfile, updateDisplayPicture };