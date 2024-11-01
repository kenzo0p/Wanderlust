const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const Listing = require('./models/listing.models.js');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");



// Set up view engine and middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this if you plan to handle JSON data
app.use(methodOverride('_method'));
app.engine('ejs' ,ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// Connect to MongoDB
main().then(() => {
    console.log("Connected to db");
}).catch((err) => {
    console.log(err);
});

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

// New listing form route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show single listing route
app.get("/listings/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).send("Listing not found");
        }
        res.render("listings/show.ejs", { listing });
    } catch (error) {
        console.error("Error fetching listing:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Create new listing route
app.post("/listings", async (req, res) => {
    const { listing } = req.body;

    // Ensure the image field is correctly structured
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
        res.status(400).send("Error saving listing");
    }
});

//Edit route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing })
});

// Update route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const updatedListing = req.body.listing;

    // Ensure image is cast correctly
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
        res.status(400).send("Error updating listing");
    }
});

//delete route
app.delete("/listings/:id" ,async (req,res)=>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

// Start the server
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});