const accordOpener = (text) => {
  const panels = document.getElementsByClassName('rpt_panel');
  for(panel of panels){
    if(panel.id === text)
      panel.style.height = 100 + '%';
    else
      panel.style.height = 0;
  }
  const accords =  document.getElementsByClassName("accord");
  for(accord of accords){
    accord.classList.remove("active");
    if(accord.textContent.includes(text))
      accord.classList.add("active");
  }
}