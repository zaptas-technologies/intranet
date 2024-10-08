
const mongoose = require("mongoose");
const config = require("./connect");


module.exports = ()=>{
   return mongoose.connect(config.mongodb.uri);
}