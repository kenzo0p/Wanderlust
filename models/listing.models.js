const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviews.model.js")

const imageSchema = new Schema({
    filename: {
        type: String,
        default: "listingimage",
    },
    url: {
        type: String,
        required: true,  // Mark URL as required
        default: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        set: (v) =>
            v === ""
                ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                : v,
    },
});

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type:String,
        type: imageSchema,  // Use the defined image schema
    },
    price: {
        type: Number,
        required: true,  // Consider marking price as required too
    },
    location: String,
    country: String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

listingSchema.post("findOneAndDelete" ,async(listing)=>{
    await Review.deleteMany({_id:{$in:listing.reviews}})
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;