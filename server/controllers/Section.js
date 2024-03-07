const Section = require("../models/Section");
const Course = require("../models/Course");

//---------> create course sections
const createSection = async (req, res) => {
    try {
        //fetch data
        const { sectionName, courseId } = req.body;

        // data validation
        if (!sectionName || !courseId) {
            console.log("got this",req.body);
            return res.status(400).json({
                success: false,
                msg: "Please fill all fields"
            });
        }

        //create section
        const newSection = await Section.create({
            sectionName
        });

        //update course with object id
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            { $push: { courseContent: newSection._id } },
            { new: true }
        );

        //HW: user populate to replace sections/subsections both in the updatedCourseDetails

        //return response
        return res.status(201).json({
            success: true,
            message: "New section created",
            updateCourseDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unalbe to create section, please try again',
            error: error.message,
        });
    }
};

//update section
const updateSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, sectionId } = req.body;

        //data validation
        if (sectionName == !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Both field are required"
            });
        }

        //update data 
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        //return  response
        return res.status(200).json({
            success: true,
            message: "Section has been updated successfully!",
        });
    } catch (error) {
        console.log("Error : ", error);
        return res.status(500).json({
            success: false,
            message: "Server Error!, uable to update section",
        });
    }
};


//----------> Delete section
const deleteSection = async (req, res) => {
    try {
        //get ID assumin that we are sending ID in params
        const { sectionId } = req.params;

        //use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        //return response
        return res.status(200).json({
            success: true,
            message: 'Section deleted Successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error!, Unable to delete the section.",
        });
    }
};

module.exports = {createSection, updateSection, deleteSection}

