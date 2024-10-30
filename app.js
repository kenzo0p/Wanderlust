const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const Listing = require('./models/listing.models.js');
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

main().then(() => {
    console.log("Connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.get('/', (req, res) => {
    res.send("I am root");
});

app.get('/listings', async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
});

// create route
app.post("/listings", async (req, res) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});