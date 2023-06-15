const toast = (text, icon, position) => {
    let body = document.getElementById("body-main");
    Swal.fire({
        text: text,
        target: "#body-main",
        icon: icon,
        // customClass: {
        //     container: "position-absolute",
        // },
        toast: true,
        showConfirmButton: false,
        position: position,
    });
};


function verificarExistencia() {
    const usuarioExiste = sessionStorage.getItem("usuario");
    const cartIdExiste = sessionStorage.getItem("cartId");

    console.log("usuarioExiste,cartIdExiste", usuarioExiste, cartIdExiste);
    if (usuarioExiste != null && cartIdExiste != null) {
        console.log("entre");
        loginStyling(usuarioExiste, cartIdExiste);
    } else {
        console.log("no entre");
        logOutStyling();
    }
}

// verificarExistencia();
