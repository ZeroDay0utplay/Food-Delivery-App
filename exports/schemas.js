const prodSchema = {
    "phone_number": Number, "prod": String, "ingredient": [String], "sauces": Map, "salades": Map
};

const userSchema = {
    "First_Name": String,
    "Last_Name": String,
    "phone_number": Number,
    "Password": {type: String},
    "Email_Address": String
};

const cmdSchema = {
    "phone_number": Number,
    "command" : [Map]
}

const prod_priceSchema = {
    "prod_name": String,
    "ingredient": String,
    "price": Number
}



const resto_prodSchema = {
    "prod_name": String,
    "description": String,
    "price": Number,
    "rating": Number
}



module.exports = {
    prodSchema,
    userSchema,
    cmdSchema,
    prod_priceSchema,
    resto_prodSchema
}