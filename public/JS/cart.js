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
    event.preventDefault(); //--> prevent page from reload
    const prods = form.getElementsByClassName("pn");
    

    var command;

    if (event.submitter.classList.contains("del_elm")){
        let prod_id = prods[parseInt(event.submitter.id.slice(-1))-1].id;
        console.log(prod_id);
        command = {
            "post_route": "/del_prod",
            "prod_id": prod_id,
        }
        
    }
    else{
        cmds = [];
        for (let i=0; i<prods.length; i++){
            let prod_id = prods[i].id;
            let prod_quantity = document.getElementById(`pm_num${i+1}`).innerHTML;
            cmds.push({
                "prod_id": prod_id,
                "quantity": prod_quantity
            })
        }
        console.log(cmds);
        command = {"post_route": "/cart", "cmds": cmds}
    }
    fetch("/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(command)
    })
})