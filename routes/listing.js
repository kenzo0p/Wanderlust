const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.models.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); // Note: Destructure listingSchema from your schema file
const { connect } = require("mongoose");


const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    // Use error.details[0].message to provide specific validation feedback
    return next(new ExpressError(400, error.details[0].message));
  }
  next();
};

// Listings index route
router.get("/", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Internal Server Error");
  }
});

// New listing form route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create new listing route with validation middleware
router.post(
  "/",
  validateListing,
 async (req, res, next) => {
    const { listing } = req.body;

    // Set default image if none provided
    if (!listing.image || !listing.image.url) {
      listing.image = {
        filename: "listingimage",
        url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      };
    }

    try {
      const newListing = new Listing(listing);
      await newListing.save();
      req.flash("success","New Listing Created.")
      res.redirect("/listings");
    } catch (error) {
      console.error("Error saving listing:", error);
      next(error);
    }
  });

// Edit route
router.get("/:id/edit", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error","Listing you requested for does not exist")
    res.redirect("/listings")
  }
  res.render("./listings/edit.ejs", { listing });
});

// Show single listing route
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
      req.flash("error","Listing you requested for does not exist")
      res.redirect("/listings")
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update route
router.put("/:id", validateListing, async (req, res, next) => {
  const { id } = req.params;
  const updatedListing = req.body.listing;

  // Set default image if none provided
  if (!updatedListing.image || !updatedListing.image.url) {
    updatedListing.image = {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    };
  }

  try {
    await Listing.findByIdAndUpdate(id, { ...updatedListing });
    req.flash("success","Listing updated successfully.")
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    next(error);
  }
});

// Delete route
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing is deleted.")
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting listing:", error);
    next(error);
  }
});

module.exports = router;
