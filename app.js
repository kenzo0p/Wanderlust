const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const listings = require('./routes/listing.js')
const reviews = require('./routes/review.js')
const ExpressError = require('./utils/ExpressError.js')




// Set up view engine and middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



// Connection to MongoDB
main().then(() => console.log("Connected to db")).catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


// Root route
app.get('/', (req, res) => {
    res.send("I am root");
});


// routes
app.use('/listings',listings) //all listings
app.use("/listings/:id/reviews" , reviews)




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