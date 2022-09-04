let nbClicks = 0


document.addEventListener("click", (e) => {
  let target = e.target.classList;
  if (target.contains("menu-btn") || target.contains("fas") || target.contains("fa-times")){
    nbClicks++;
    nbClicks%=2;
    // let elements = document.getElementsByClassName("table-responsive");
    // if (nbClicks){
    //   for (let i=0; i<elements.length; i++) elements[i].style.display = "none";
    // }
    // else{
    //   for (let i=0; i<elements.length; i++) elements[i].style.display = "block";
    // }
    if (document.getElementsByClassName("alert").length !== 0) document.getElementsByClassName("alert")[0].style.display = (nbClicks) ? "none" : "block";
    if (document.getElementById("prod_form")) document.getElementById("prod_form").style.display = (nbClicks) ? "none" : "block";
  }
})