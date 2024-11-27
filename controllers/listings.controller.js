const Listing = require("../models/listing.models.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      res.redirect("/listings");
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.createlisting = async (req, res, next) => {
  const { listing } = req.body;

  // Set default image if none provided
  if (!listing.image || !listing.image.url) {
    listing.image = {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    };
  }
  try {
    let response = await geocodingClient
      .forwardGeocode({
        query: listing.location,
        limit: 1,
      })
      .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();

    req.flash("success", "New Listing Created.");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error saving listing:", error);
    next(error);
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
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
    let listing = await Listing.findByIdAndUpdate(id, { ...updatedListing });
    if(typeof req.file !== "undefined") {
      let filename = req.file.filename;
      let url = req.file.path;
      listing.image = {url, filename};
      await listing.save();
    }

    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    next(error);
  }
};

module.exports.deleteListings = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is deleted.");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error deleting listing:", error);
    next(error);
  }
};
