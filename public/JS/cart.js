let ez = document.getElementsByClassName("num").length;
let sum = 0;

for (let i=1; i<=ez; i++){
    let qty = document.getElementById(`pm_num${i}`).innerHTML;
    let prix = document.getElementById(`prix${i}`).value;
    let total = parseInt(qty) * parseInt(prix);
    document.getElementById(`price${i}`).innerHTML = "$ " + total;
    sum += total;
}


function select_ch(){    
    select = document.getElementById("selected").value;
    selected_elm = select.split(" ").slice(0, 3).join("");
    console.log(selected_elm);
    document.getElementById("total_liv").innerHTML = "$ " + (parseFloat(sum) + parseFloat(select.split(" ")[5]) + ".00");
}



select_ch();

document.getElementById("total").innerHTML = "$ " + sum + ".00";


let form = document.getElementById("cart");

document.addEventListener("submit", (event)=>{
    //event.preventDefault(); //--> prevent page from reload
    const prods = form.getElementsByClassName("pn");
    
    var command;

    if (event.submitter.classList.contains("del_elm")){
        let prod_id = prods[parseInt(event.submitter.id.slice(-1))-1].id;
        command = {
            "post_route": "/del_prod",
            "prod_id": prod_id,
        }
        
    }
    else if (event.submitter.classList.contains("minus")){
        let prod_id = prods[parseInt(event.submitter.id.slice(-1))-1].id;
        command = {
            "post_route": "/minus",
            "prod_id": prod_id,
        }
    }
    else if (event.submitter.classList.contains("plus")){
        let prod_id = prods[parseInt(event.submitter.id.slice(-1))-1].id;
        command = {
            "post_route": "/plus",
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
        command = {"post_route": "/cart", "cmds": cmds, "delivery": selected_elm}
    }
    fetch("/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(command)
    })
})