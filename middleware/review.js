// Import required modules
require('dotenv').config();
const Joi = require("joi");
require("../utils.js");

// Define error messages
const errorMessages = {
    emptyReview: 'Please provide a review',
    emptyRating: 'Please provide a rating for each category'
}

// Define review validation schema using Joi
const reviewScheme = Joi.object({
    review: Joi.string().min(2).max(256).required(),
    courseContentSliderValue: Joi.required(),
    courseStructureSliderValue: Joi.required(),
    teachingStyleSliderValue: Joi.required(),
    studentSupportSliderValue: Joi.required(),
});

/**
 * Middleware function for validating review data.
 * Validates the review and rating values in the request body using the reviewScheme.
 * Sets an error message if validation fails or if any input or rating is empty.
 * Calls the next middleware function if validation succeeds.
 * @author Chelsea Yang
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 */
const reviewValidation = async (req, res, next) => {
    // Extract the review and rating values from the request body
    let review = req.body.review;
    let courseContentSliderValue = req.body.courseContentSliderValue;
    let courseStructureSliderValue = req.body.courseStructureSliderValue;
    let teachingStyleSliderValue = req.body.teachingStyleSliderValue;
    let studentSupportSliderValue = req.body.studentSupportSliderValue;

    const validationResult = reviewScheme.validate({
        review, courseContentSliderValue,
        courseStructureSliderValue, teachingStyleSliderValue, studentSupportSliderValue
    });

    let errorMessage = '';

    // Check if there is an empty input or validation error
    if (validationResult.error != null) {
        if (review.length < 1) {
            // Set the error message to indicate an empty review
            errorMessage = errorMessages.emptyReview;
        } else if (courseContentSliderValue == null ||
          courseStructureSliderValue == null ||
          teachingStyleSliderValue == null ||
          studentSupportSliderValue == null) {
            // Set the error message to indicate empty ratings for each category
            errorMessage = errorMessages.emptyRating;
        }

        // Set the error message in the request object
        req.errorMessage = errorMessage;
    }

    // Call the next middleware function
    next();
}

// Export the reviewValidation function
module.exports = {
    reviewValidation
}
