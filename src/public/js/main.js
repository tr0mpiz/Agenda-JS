

function setActiveClass() {
    // Obtener la URL actual
    var currentUrl = window.location.href;
    var path = new URL(currentUrl).pathname;
    
    // Obtener todos los elementos <a> dentro de la clase "menu-sub"
    var menuSubLinks = document.querySelectorAll('.menu-sub a');

    // Iterar sobre los elementos y agregar la clase "active" al elemento con href="/agenda/alta" y su elemento <li> padre
    for (var i = 0; i < menuSubLinks.length; i++) {
    var link = menuSubLinks[i];
    if (link.getAttribute('href') === path) {
        link.classList.add('active');
        link.closest('li').classList.add('active');
        link.closest('li').closest('ul').parentNode.classList.add('open');
        
    }
    }
    
  }

setActiveClass();


function showBootstrapToast(title, message, duration) {
  
  var toast = document.getElementById("toast");
  var toastTitle = toast.querySelector(".me-auto");
  var toastBody = toast.querySelector(".toast-body");
  
  toast.classList.add("show");
  toastTitle.textContent = title;
  toastBody.textContent = message;

  setTimeout(function() {
    toast.classList.remove("show");
  }, duration);
}
