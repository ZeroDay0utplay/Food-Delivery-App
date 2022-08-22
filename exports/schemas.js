const mongoose = require("mongoose");



const prodSchema = {
    "prod": String, "ingredient": [String], "sauces": Map, "salades": Map
};

const userSchema = {
    "First_Name": String,
    "Last_Name": String,
    "phone_number": Number,
    "Password": String,
    "Email_Address": String
};

const cmdSchema = {
    "command" : [Map]
}

const prod_priceSchema = {
    "prod_name": String,
    "ingredient": String,
    "price": Number
}

const User = mongoose.model("User", userSchema);

const Prod = mongoose.model("Prod", prodSchema);

const Command = mongoose.model("Command", cmdSchema);

const Price = mongoose.model("Price", prod_priceSchema)


module.exports = {
    User,
    Prod,
    Command,
    Price
}