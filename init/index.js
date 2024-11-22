const mongoose =require('mongoose');
const initData = require('./data.js');
const Listing  =require('../models/listing.models.js');


main().then(()=>{
    console.log("connected to db");
}).catch((err)=>[
    console.log(err)
])

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}


const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner:"6740c39a4b20c9082e02a4cd"}))
    await Listing.insertMany(initData.data);
    console.log("data init");
};

initDB();