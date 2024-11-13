const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const Listing = require('./models/listing.models.js');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const { listingSchema , reviewSchema } = require('./schema.js'); // Note: Destructure listingSchema from your schema file
const Review = require('./models/reviews.model.js')

console.log("hello")
// Set up view engine and middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Connect to MongoDB
main().then(() => console.log("Connected to db")).catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

// Root route
app.get('/', (req, res) => {
    res.send("I am root");
});

// Listings index route
app.get('/listings', async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Validation Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        // Use error.details[0].message to provide specific validation feedback
        return next(new ExpressError(400, error.details[0].message));
    }
    next();
};
const validateReview = (req, res, next) => {
    console.log("middleware")
    console.log(req.body.review);
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // Use error.details[0].message to provide specific validation feedback
        return next(new ExpressError(400, error.details[0].message));
    }
    next();
};

// New listing form route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show single listing route
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id).populate("reviews")
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/show.ejs", { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Create new listing route with validation middleware
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    const { listing } = req.body;

    // Set default image if none provided
    if (!listing.image || !listing.image.url) {
        listing.image = {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        };
    }

    try {
        const newListing = new Listing(listing);
        await newListing.save();
        res.redirect("/listings");
    } catch (error) {
        console.error("Error saving listing:", error);
        next(error);
    }
}));

// Edit route
app.get("/listings/:id/edit", async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
});

// Update route
app.put("/listings/:id", validateListing, async (req, res, next) => {
    const { id } = req.params;
    const updatedListing = req.body.listing;

    // Set default image if none provided
    if (!updatedListing.image || !updatedListing.image.url) {
        updatedListing.image = {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
        };
    }

    try {
        await Listing.findByIdAndUpdate(id, { ...updatedListing });
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        next(error);
    }
});

// Delete route
app.delete("/listings/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (error) {
        console.error("Error deleting listing:", error);
        next(error);
    }
});

// Reviews
// post route
app.post('/listings/:id/reviews' ,validateReview, wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review);


    listing.reviews.push(newReview)
    await newReview.save()
    await listing.save()

    res.redirect(`/listings/${listing._id }`)
}))

// Catch-all route for undefined routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error-handling middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Start the server
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
