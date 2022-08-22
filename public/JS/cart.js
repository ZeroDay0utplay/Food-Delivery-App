let total = document.getElementsByClassName("total");
let slctd = document.getElementById("selected");
let price = document.getElementsByClassName("price");
let prod = document.getElementById("cmd");

let dollar_sign = "$";

let price_num = [];
let total_price = [];
let sum = 0;


for (let i=0; i<price.length; i++){
    let numb = parseFloat(price[i].innerHTML.split(" ")[1])
    let prod_qty = document.getElementsByClassName("num")[i].innerHTML;
    price_num.push(numb / prod_qty);
    total_price.push(numb / prod_qty);
    sum += numb;
}

let items = document.getElementsByClassName("elm").length;

top_items = document.getElementById("items")
top_items.innerHTML = items + " items";

bottom_items = document.getElementById("bottom_items")
bottom_items.innerHTML = items + " ITEMS";


let init_liv = 2;

let select = document.getElementById("selected").value;
total[0].innerHTML = dollar_sign + sum;
total[1].innerHTML = dollar_sign + (sum + init_liv);


function select_ch(){    
    select = document.getElementById("selected").value;
    total[1].innerHTML = dollar_sign + (parseFloat(sum) + parseFloat(select.split(" ")[5]));
    init_liv = parseFloat(select.split(" ")[5]);
}



document.addEventListener("click", (e)=>{
    if (e.target.classList.contains("pm")){
        
        let target_id = e.target.id;
        let elm_num_ind = target_id[target_id.length-1];
        let ind = elm_num_ind - 1;        
        let cnt = document.getElementById('pm_num' + elm_num_ind);

        if (e.target.classList.contains("plus")){
            cnt.innerHTML++;
        }
        
        else if (e.target.classList.contains("minus")){
            if (document.getElementById('pm_num' + (elm_num_ind)).innerHTML > 0){
                cnt.innerHTML--;
            }
        }


        total_price[ind] = price_num[ind] * document.getElementsByClassName("num")[ind].innerHTML;
        sum = price_num[ind] * document.getElementsByClassName("num")[ind].innerHTML;
        document.getElementById("price" + (elm_num_ind)).innerHTML = dollar_sign + total_price[ind];
        total[0].innerHTML = dollar_sign + sum;
        total[1].innerHTML = dollar_sign + (sum + init_liv);

    }
});




let form = document.getElementById("cart");
form.addEventListener("submit", (event)=>{
    console.log(event);
    //event.preventDefault(); //--> prevent page from reload
    const prods = form.getElementsByClassName("pn");
    const prod_ingredient = form.getElementsByClassName("pi");
    const prod_qty = form.getElementsByClassName("num");

    var command;

    if (event.submitter.classList.contains("del_elm")){
        let removed_prod = prods[parseInt(event.submitter.id.slice(-1))-1].innerHTML
        let ingred_rm_prod = prod_ingredient[parseInt(event.submitter.id.slice(-1))-1].innerHTML
        let qty_rm_prod = prod_qty[parseInt(event.submitter.id.slice(-1))-1].innerHTML
        command = {
            "post_route": "/del_prod",
            "prod_name": removed_prod,
            "prod_ingredient": ingred_rm_prod,
            "prod_quantity": qty_rm_prod
        }
        
    }
    else{
        cmds = [];
        for (let i=0; i<prods.length; i++){
            cmds.push({
                "prod_name": prods[i].innerHTML,
                "prod_ingredient": prod_ingredient[i].innerHTML,
                "prod_quantity": prod_qty[i].innerHTML
            })
        }
        command = {"post_route": "/cart", "cmds": cmds}
    }
    fetch("/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(command)
    })
})