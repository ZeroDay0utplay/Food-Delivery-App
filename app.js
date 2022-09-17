
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");




mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PWD + "@cluster0.8jvshni.mongodb.net/tac_tac");
//mongoose.connect("mongodb://localhost:27017/tac_tac")



const auth = require("./exports/auth.js");
const schemas = require("./exports/schemas.js");

const User = mongoose.model("User", schemas.userSchema);

const Prod = mongoose.model("Prod", schemas.prodSchema);

const Command = mongoose.model("Command", schemas.cmdSchema);

const Price = mongoose.model("Price", schemas.prod_priceSchema)

const resto_Prods = mongoose.model("resto_Prods", schemas.resto_prodSchema);

const prod_descriptions = mongoose.model("prod_descriptions", schemas.prod_descriptionSchema);




const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(cookieParser());




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

app.get("/product", auth.authorization, (req, res) => {
    res.render("product", {produit: "Pizza", ing: ingred});
})

app.get("/cart", auth.authorization, (req, res) => {
    Prod.find({"phone_number": req.phone_number}).then(data => { 
        res.render("cart", {cmd_sub: "", prods: data});
    });
})

app.get("/resto", auth.authorization, (req, res) => {
    resto_Prods.find().then(data => {
        res.render("resto", {resto_prods: data});
    })
})



app.get("/logout", (req, res) => {
    res.clearCookie("access_token");
    res.render("sign_in", {login: ""});
    res.end();
})


app.post("/sign_up", (req, res) => {
    let First_Name= req.body.first_name;
    let Last_Name = req.body.last_name;
    let phone_num = req.body.phone;
    let email = req.body.email;
    let passwd = req.body.pwd;
    if (phone_num.length != 8 || isNaN(phone_num)) {
        res.render("sign_up", {login: "invalid_phone"});
    }
    else{
        User.find({"phone_number": phone_num}).then(data => {
            if (data.length !== 0)  res.render("sign_up", {login: "used_phone"})
            else {
                bcrypt.hash(passwd, 10, (err, hashed_pwd) => {
                    User.create({"First_Name": First_Name, "Last_Name": Last_Name, "phone_number": phone_num, "Email_Address": email, "Password": hashed_pwd});
                    res.render("sign_in", {login: ""});
                })
            }
        })
    }
});


app.post("/sign_in", (req, res) => {
    let phone_num = req.body.phone;
    let passwd = req.body.pwd;
    User.find({"phone_number": phone_num}).then(data => {
        if (data.length === 0) res.render("sign_in", {login: "wrong_phone"});
        else{
            bcrypt.compare(passwd, data[0].Password, (err, result) => {
                if (result === true){
                    const token = auth.generateAccessToken({ "phone_number": phone_num });
                    res.cookie("access_token", token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    })
                    resto_Prods.find().then(data => {
                        res.render("resto", {resto_prods: data});
                    })
                }
                
                else res.render("sign_in", {login: "wrongpwd"})
            })
        } 
    })

});


app.post("/resto", auth.authorization, (req, res) => {
    let product_name = req.body.prod_name;
    //console.log(product_name);
    prod_descriptions.find({"prod_name": product_name})
    //.then(data => console.log(data));
    //.then(d => console.log(d[0].buttons[0].components));
    .then(data => res.render("product", {produit: data[0], ing: ""}));
})

app.post("/product", auth.authorization, (req, res) => {
    let prod_body = req.body;
    let ingredients = [];
    let sauces = {};
    let salades = {};
    
    let prod_name = prod_body.prod_name;

    console.log(prod_body);

    if (prod_body.escalope == "on") ingredients.push("escalope");
    if (prod_body.chawarma == "on") ingredients.push("chawarma");
    if (prod_body.thon == "on") ingredients.push("thon");
    if (prod_body.salami == "on") ingredients.push("salami");
    if (prod_body.kwika == "on") ingredients.push("kwika");
    if (prod_body.jombon == "on") ingredients.push("jombon");

    sauces["harisa"] = prod_body.harisa;
    sauces["salata__Mechweya"] = prod_body.sal_mech;
    sauces["mayonnaise"] = prod_body.may;
    sauces["barbecue"] = prod_body.barbecue

    salades["onion"] = prod_body.onion;
    salades["tomate"] = prod_body.tomate;
    salades["laitue"] = prod_body.laitue;

    pate = (prod_name === "Malawi") ? ((prod_body.pate === undefined) ? "": prod_body.pate) : "";
    
    size = ""
    if (prod_name === "Pizza") size = prod_body.size;
    if (prod_name == "BaguetteFarcie") size = prod_body.size;

    //console.log("Prod_Name: " + prod_name, "ing: " + ingredients, "size: "+size, "pate: "+pate)


    if (ingredients.length === 0){
        prod_descriptions.find({"prod_name": prod_name})
        .then(prd_data => res.render("product", {produit: prd_data[0], ing: "no_ing"}))
    }
    
    else{
        Price.find({"prod_name": prod_name, "ingredient": ingredients, "Size": size, "Pate": pate}).then(d => {
            if (d.length !== 0){
                let prod_price = d[0].price;
                let components = {"phone_number": req.phone_number, "prod": prod_name,"ingredient": ingredients, "sauces": sauces, "salades": salades, "Frites": prod_body.frite, "price": prod_price, "Size": size, "Pate": pate};
                Prod.find(components).then(prods_data => {
                    if (prods_data.length!==0){
                        let new_qty = prods_data[0].quantity+1;
                        let new_tot_price = parseInt(prods_data[0].total_price) + parseInt(prods_data[0].price);
                        
                        Prod.findOneAndUpdate(components, {"quantity": new_qty, "total_price": new_tot_price}).then();
                        
                    } 
                    else{
                        components["total_price"] =  prod_price;
                        components["quantity"] = 1;
                        Prod.create(components);
                    }
                })
                prod_descriptions.find({"prod_name": prod_name})
                .then(prd_data => res.render("product", {produit: prd_data[0], ing: "success"}))

                ingred = ""; // for removing succ/err msg for a new command
            }
            else {
                prod_descriptions.find({"prod_name": prod_name})
                .then(prd_data => res.render("product", {produit: prd_data[0], ing: ""}))
            } // add not found in DB error in ejs file
        })
    }


})



app.post("/cart", auth.authorization, (req, res) => {
    // 2 post requests at the same time
    let post_req = req.body;
    let prod_id = post_req.prod_id;
    //if (Object.keys(post_req).length !== 0) arr.push(post_req);

    let post_route = post_req.post_route;


    if (post_route === "/del_prod"){
        //Prod.deleteOne({"_id": prod_id}).then();
        Prod.find().then(data => {    
            res.render("cart", {cmd_sub: "delete_prod", prods: data});
        });
    }
    
    else if (post_route === "/minus"){
        Prod.find({"_id": prod_id}).then(
            d=>{
                if (d[0]["quantity"] === 1) Prod.deleteOne({"_id": prod_id}).then();
                else Prod.findByIdAndUpdate(prod_id, {$inc: {"quantity": -1, "total_price": -d[0]["price"]}}).then();
            }
        );
    }

    else if (post_route === "/plus"){
        Prod.findByIdAndUpdate(prod_id, {$inc: {"quantity": 1}}, (err, raw)=>{});
        // .then(
        //     d=>{
        //         Prod.findByIdAndUpdate(prod_id, {$inc: {"quantity": 1, "total_price": d[0]["price"]}}).then();
        //     }
        // );
        // Prod.find().then(data => {    
        //     res.render("cart", {cmd_sub: "delete_prod", prods: data});
        // });
    }

    else if (post_route == "/cart"){
        let commands = []
        let elements = post_req.cmds;
        for (let i=0; i<elements.length; i++){
            let prod_id = mongoose.Types.ObjectId(elements[i].prod_id);
            Prod.find({"_id": prod_id}).then(d =>{
                    Command.find({"_id": prod_id}).then(ez => {
                        if (ez.length === 0) Command.insertMany(d).then();
                    })
                }   
            )
        }
        

        if (commands.length !== 0){ //never add empty submit to DB
            if (Command.find({"phone_number": req.phone_number, "command": commands}).then(cmds_data => { // add time checker (30s) between each cmd
                if (cmds_data.length===0){
                    const command = new Command({"phone_number": req.phone_number, "command": commands}); 
                    command.save();
                }
            }));
        }
        //Prod.deleteMany({"phone_number": req.phone_number}).then();
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