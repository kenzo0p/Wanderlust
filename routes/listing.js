const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.controller.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const {storage} = require('../cloudinary.js')
const multer = require('multer')
const upload = multer({storage})

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('listing[image]'),validateListing, listingController.createlisting);

// New listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(listingController.showListings)
  .put(isLoggedIn, isOwner, validateListing, listingController.updateListing)
  .delete(isLoggedIn, isOwner, listingController.deleteListings);

// Edit route
router.get("/:id/edit", isLoggedIn, listingController.renderEditForm);

module.exports = router;
