const prodSchema = {
    "phone_number": Number,
    "prod": String,
    "ingredient": [String],
    "sauces": Map,
    "salades": Map,
    "Frites": String,
    "Size": String,
    "Pate": String,
    "price": Number,
    "quantity": Number,
    "total_price": Number
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
    "command" : [Map],
    "delivery": Number
}

const prod_priceSchema = {
    "prod_name": String,
    "ingredient": [String],
    "price": Number,
    "Size": String,
    "Pate": String
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