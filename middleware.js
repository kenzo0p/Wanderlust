const Listing = require('./models/listing.models.js')
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js"); // Note: Destructure listingSchema from your schema file
const { reviewSchema } = require("./schema.js");
const Review = require('./models/reviews.model.js')

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl
        req.flash('error',"You must be logged in to create listing!");
        return res.redirect('/login');
    }
    next();
}

module.exports.saveRedirect = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error","You are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, _res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      // Use error.details[0].message to provide specific validation feedback
      return next(new ExpressError(400, error.details[0].message));
    }
    next();
  };

  module.exports.validateReview = (req,res, next) => {
    console.log("middleware");
    console.log(req.body.review);
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      // Use error.details[0].message to provide specific validation feedback
      return next(new ExpressError(400, error.details[0].message));
    }
    next();
};
module.exports.isReviewAuthor = async(req,res,next)=>{
    const { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error","You are not the author of this review");
      return res.redirect(`/listings/${id}`);
    }
    next();
}