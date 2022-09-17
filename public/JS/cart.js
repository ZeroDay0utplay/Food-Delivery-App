


let form = document.getElementById("cart");
form.addEventListener("submit", (event)=>{
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
        console.log(cmds);
        command = {"post_route": "/cart", "cmds": cmds}
    }
    console.log(command);
    fetch("/cart", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(command)
    })
})