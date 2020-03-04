var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = mongoose.Schema({
    username: String,
    password: String
});

// add utility methods provided by passport-local-mongoose
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);