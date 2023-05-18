require('dotenv').config();
const Joi = require("joi");
require("../utils.js");

const errorMessages = {
    emptyReview: 'please provide a review',
    emptyRating: 'Please provide a rating for each category'
}

const reviewScheme = Joi.object({
    review: Joi.string().min(2).max(256).required(),
    courseContentSliderValue: Joi.required(),
    courseStructureSliderValue: Joi.required(),
    teachingStyleSliderValue: Joi.required(),
    studentSupportSliderValue: Joi.required(),
});

const reviewValidation = async (req, res, next) => {
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

    console.log(validationResult);
    // if there is an empty input or error
    if (validationResult.error != null) {
        if (review.length < 1) {
            errorMessage = errorMessages.emptyReview;
        } else if (courseContentSliderValue == null) {
            errorMessage = errorMessages.emptyRating;
        } else if (courseStructureSliderValue == null) {
            errorMessage = errorMessages.emptyRating;
        } else if (teachingStyleSliderValue == null) {
            errorMessage = errorMessages.emptyRating;
        } else if (studentSupportSliderValue == null) {
            errorMessage = errorMessages.emptyRating;
        }

        req.errorMessage = errorMessage;

        // return res.status(400).json({ error: errorMessage });
    }

    next();
}

module.exports = {
    reviewValidation
}