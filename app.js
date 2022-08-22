
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const cookieParser = require("cookie-parser");




mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PWD + "@cluster0.8jvshni.mongodb.net/tac_tac");
// mongoose.connect("mongodb://localhost:27017/tac_tac")




function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

const authorization = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
      return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, process.env.TOKEN_SECRET);
        req.phone_number = data.phone_number;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};



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

const User = mongoose.model("User", userSchema);

const Prod = mongoose.model("Prod", prodSchema);

const Command = mongoose.model("Command", cmdSchema);

const Price = mongoose.model("Price", prod_priceSchema)

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(cookieParser());




let login_msg = "";
let su_msg = "";
let ingred = "";

app.get("/", (req, res) => {
    res.render("sign_in", {login: ""});
})

app.get("/sign_in", (req, res) => {
    res.render("sign_in", {login: ""});
})

app.get("/sign_up", (req, res) => {
    res.render("sign_up", {login: ""});
})

app.get("/product", authorization, (req, res) => {
    res.render("product", {produit: "Pizza", ing: ingred});
})

app.get("/cart", authorization, (req, res) => {
    Prod.find({"phone_number": req.phone_number}).then(data => {    
        res.render("cart", {cmd_sub: "", prods: data});
    });
})

app.get("/resto", authorization, (req, res) => {
    res.render("resto");
})



app.post("/sign_up", (req, res) => {
    let First_Name= req.body.first_name;
    let Last_Name = req.body.last_name;
    let phone_num = req.body.phone;
    let email = req.body.email;
    let passwd = req.body.pwd;
    User.find({"phone_number": phone_num}).then(data => {
        if (data.length !== 0)  res.render("sign_up", {login: "used_phone"})
        else {
            bcrypt.hash(passwd, 10, (err, hashed_pwd) => {
                User.create({"First_Name": First_Name, "Last_Name": Last_Name, "phone_number": phone_num, "Email_Address": email, "Password": hashed_pwd});
                res.render("sign_in", {login: ""});
            })
        }
    })
});


app.post("/sign_in", (req, res) => {
    let phone_num = req.body.phone;
    let passwd = req.body.pwd;
    User.find({"phone_number": phone_num}).then(data => {
        if (data.length === 0) res.render("sign_in", {login: "wrong_phone"});
        else{
            bcrypt.compare(passwd, data[0].Password, (err, result) => {
                if (result === true){
                    const token = generateAccessToken({ "phone_number": phone_num });
                    res.cookie("access_token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    })
                    res.render("resto")
                }
                
                else res.render("sign_in", {login: "wrongpwd"})
            })
        } 
    })

});


app.post("/resto", authorization, (req, res) => {
    let product_name = req.body.prod_name;
    res.render("product", {produit: product_name, ing: ""});
})

app.post("/product", authorization, (req, res) => {
    let prod_body = req.body;
    let ingredients = [];
    let sauces = {};
    let salades = {};
    
    let prod_name = prod_body.prod_name;

    if (prod_body.escalope == "on") ingredients.push("escalope");
    if (prod_body.chawarma == "on") ingredients.push("chawarma");
    if (prod_body.thon == "on") ingredients.push("thon");
    if (prod_body.salami == "on") ingredients.push("salami");
    if (prod_body.kwika == "on") ingredients.push("kwika");
    if (prod_body.jomnon == "on") ingredients.push("jombon");

    sauces["harisa"] = prod_body.harisa;
    sauces["salata__Mechweya"] = prod_body.sal_mech;
    sauces["mayonnaise"] = prod_body.may;

    salades["onion"] = prod_body.onion;
    salades["tomate"] = prod_body.tomate;
    salades["laitue"] = prod_body.laitue;

    let components = {"phone_number": req.phone_number, "prod": prod_name,"ingredient": ingredients, "sauces": sauces, "salades": salades};

    components["frite"] = "Avec Frite";

    if (prod_body.frite === "0") components["frite"] = "Sans Frite";

    ingred = (ingredients.length === 0) ?  "no_ing" : "success";
    res.render("product", {produit: prod_name, ing: ingred});
    
    if (ingred === "success"){
        const prod = new Prod(components); 
        prod.save();
    }
    
    ingred = ""; // for removing succ/err msg for a new command

})

let arr = []; //temp solution <--> problem of overflow 

app.post("/cart", authorization, (req, res) => {
    // 2 post requests at the same time
    let post_req = req.body;
    if (Object.keys(post_req).length !== 0) arr.push(post_req);

    let post_route = arr[arr.length-1].post_route;

    console.log(arr);

    if (post_route === "/del_prod"){
        let prod_name = req.body.prod_name;
        let prod_ingredient = req.body.prod_ingredient
        Prod.deleteOne({"prod": prod_name, "prod_ingredient": prod_ingredient}).then();
        Prod.find().then(data => {    
            res.render("cart", {cmd_sub: "delete_prod", prods: data});
        });
    }

    else if (post_route == "/cart"){
        cmds = []
        let elements = arr[arr.length-1].cmds;
        for (let i=0; i<elements.length; i++){
            cmds.push({"prod_name": elements[i]["prod_name"], "prod_ingredient": elements[i]["prod_ingredient"] , "prod_quantity": elements[i]["prod_quantity"]})
            Price.find({"prod_name": elements[i]["prod_name"], "ingredient": elements[i]["prod_ingredient"]}).then(data => {
                //console.log(data);
            })
        }
        const command = new Command({"phone_number": req.phone_number, "command": cmds}); 
        command.save();
        Prod.deleteMany({"phone_number": req.phone_number}).then();
        Prod.find().then(data => {    
            res.render("cart", {cmd_sub: "submitted", prods: data});
        });
    }

    else{
        Prod.find().then(data => {    
            res.render("cart", {cmd_sub: "", prods: data});
        });
    }
})




app.listen(process.env.PORT || 3000, () => {
    console.log("[+] Server is running...");
});