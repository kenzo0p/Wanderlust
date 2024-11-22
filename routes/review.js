const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.models.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/reviews.model.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js')

// post route new review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New review created.")
    res.redirect(`/listings/${listing._id}`);
  })
);

// delete route for reviews
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted.")
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
