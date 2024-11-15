const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.models.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/reviews.model.js");
const { reviewSchema } = require("../schema.js"); // Note: Destructure listingSchema from your schema file

//validation middleware for reviews

const validateReview = (req, res, next) => {
  console.log("middleware");
  console.log(req.body.review);
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    // Use error.details[0].message to provide specific validation feedback
    return next(new ExpressError(400, error.details[0].message));
  }
  next();
};

// post route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
  })
);

// delete route for reviews
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
