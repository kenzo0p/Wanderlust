const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRouter = require("./routes/user.js");
const User = require("./models/user.models.js");

// Connection to MongoDB
main()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

// Set up view engine and middlewares
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// session
const sessionOptions = {
  secret: 'mysupersecretcode',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // 7 days expiration
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    httpOnly: true,
  },
};

// Middleware setup
app.use(session(sessionOptions));
app.use(flash());
// Root route
app.get("/", (req, res) => {
  res.send("I am root");
});


// passport middlware //pbkdf2 hSING ALGORITHM
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get('/demouser',async(req,res)=>{
//   let fakeUser = new User({
//     email:'student@getMaxListeners.com',
//     username:"deltaStudent"
//   })
//   let registeredUser = await User.register(fakeUser ,"helloworld")
//   res.send(registeredUser)
// })

// routes
app.use("/listings", listingsRouter); //all listings
app.use("/listings/:id/reviews", reviewsRouter); //all reviews
app.use("/", userRouter);

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
