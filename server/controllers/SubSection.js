const Section = require("../models/Section");
const SubSections = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

const createSubSection = async (req, res) => {
    try {
        //fetch data from req body
        const { sectionId, title, timeDuration, description } = req.body;

        //extract file/videos
        const video = req.files.videoFile;

        //validation
        if (!title || !timeDuration || !description || !video || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        //upload video to cloudnary
        const updateDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create a sub-section
        const SubSectionDetails = await SubSections.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: updateDetails.secure_url,
        });

        //update section with this sub section ObjectId
        const updateSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: SubSectionDetails._id,
                }
            },
            { new: true }
        );

        //HW: log updated section here, after adding populate query

        //return response
        res.status(201).json({
            success: true,
            message: 'Sub-section created successfully',
            updateSection,
        });
    } catch (error) {
        console.log('Error in addSubSection', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};


//HW: Update a sub section details
const updateSubSection = async (req, res) => {
    const { id: subSectionId } = req.params;
    const updates = req.body;
    try {
        let subSection = await SubSection.findById(subSectionId);

        if (!subSection) {
            return res.status(400).json({
                success: false,
                message: "Sub-section not found"
            })
        }

        subSection = await SubSection.findByIdAndUpdate(subSectionId, updates, { new: true });
        res.status(200).json({
            success: true,
            data: subSection
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            err: err.message
        });
    }
};


//HW: deleteSubsection
const deleteSubSection = async (req, res) => {
    const { id: subSectionId } = req.params;
    try {
        // Check if the sub section exists
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "Sub-section not found"
            });
        }

        // Delete the sub section
        await subSection.findByIdAndDelete(subSectionId);

        // Remove the reference to the sub section from the parent section
        await Section.updateOne({ subSection: subSectionId }, { $pull: { subSection: subSectionId } });

        res.status(200).json({
            success: true,
            message: "Sub-section deleted successfully"
        });
    } catch (error) {
        console.log('Error in deleteSubSection', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = { createSubSection, updateSubSection, deleteSubSection };
