let nbClicks = 0


document.addEventListener("click", (e) => {
  let target = e.target.classList;
  if (target.contains("menu-btn") || target.contains("fas") || target.contains("fa-times")){
    nbClicks++;
    nbClicks%=2;
    document.getElementsByClassName("alert")[0].style.display = (nbClicks) ? "none" : "block";
    document.getElementById("prod_form").style.display = (nbClicks) ? "none" : "block";
  }
})