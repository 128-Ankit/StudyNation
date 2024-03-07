const Category = require("../models/Category");


//----->  create Category handler function
const createCategory = async (req, res) => {
    try {
        //fecth data from req body
        const { name, description } = req.body;

        //validation 
        if (!name || !description) {
            return res.status(400).json({
                msg: "Please enter all fields"
            });
        }

        //create entry in DB
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });

        //return response
        res.status(201).json({
            success: true,
            msg: "Category created successfully",
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

//-------> getAllCategory handler function
const showAllCategory = async (req, res) => {
    try {
        const allCategory = await Category.find({}, {
            name: true,
            description: true
        });
        res.status(200).json({
            success: true,
            msg: 'Showing All Category',
            allCategory,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Server Error! To getAllCategory"
        });
    }
};

//-------> updateCategory handler function
const updateCategory = async (req, res) => {
    try {
        // Get categoryId and updated data from request body
        const { categoryId } = req.params;
        const { name, description } = req.body;

        // Validation: Check if categoryId is provided
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                msg: "Category ID is required"
            });
        }

        // Find the category by ID and update it
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true });

        // Check if the category exists
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                msg: "Category not found"
            });
        }

        // Return success response with updated category
        res.status(200).json({
            success: true,
            msg: "Category updated successfully",
            updatedCategory
        });

    } catch (error) {
        // Handle errors
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Server Error"
        });
    }
};

//------> categoryPageDetails
const categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const { CategoryId } = req.body;

        //get courses for specifies categoryId
        const selectedCategory = await Category.findById(CategoryId)
            .populate("courses")
            .exec();

        //validation
        if (!selectedCategory) {
            return res.status(401).json({
                success: false,
                message: "No such Category found!"
            });
        }

        //get courses for different categories
        const differentCategories = await Category.find({
            _id: { $ne: CategoryId }
        })
            .populate("courses")
            .exec();

        //get top selling courses
        const allCategories = await Category.find().populate(
            'courses');
        const allCourses = allCategories.findMap((category) => category.courses);
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice[0, 10];

        //return response
        return res.status(200).send({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses
            },
        });


    } catch (error) {
        console.log('Error in categoryPageDetails', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error!'
        });
    }
};

module.exports = { createCategory, showAllCategory, categoryPageDetails, updateCategory};