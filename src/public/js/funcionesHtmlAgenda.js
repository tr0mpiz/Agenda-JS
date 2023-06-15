import { isWindows } from "nodemon/lib/utils";

const borrarProductoHtml = (id) => {
    const urlActual = removeQueryString(window.location.href) + "/" + id;
    // console.log("urlActual", urlActual);
    $.ajax({
        type: "DELETE",
        url: urlActual,
        // data: formData,
        success: function (response) {
            toast("El producto se a eliminadoo con exito!!", "success", "bottom-right");
        },
        error: function (xhr, status, error) {
            console.log(error);
            toast("Ha ocurrido un error!!", "error", "bottom-right");
        },
    });
};

function removeQueryString(url) {
    const pattern = /\/products\?.*$/;
    return url.replace(pattern, "/products");
}

$(document).ready(function () {

    
    $("#agendar-cita-form").submit(function (event) {
       

        let formData = new FormData(this);
        const urlActual = window.location.href;

        $.ajax({
            url: urlActual,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                console.log(response);
                toast("La cita se a agrego con exito !", "success", "bottom-right");
                windows.location.reload();
                // Manejar la respuesta del servidor
            },
            error: function (error) {
                console.log(error);
                toast("Ha ocurrido un error, recarga la pagina.", "error", "bottom-right");
                // Manejar errores de la solicitud
            },
        });
    });
});


const agregarCarrito = (productId) => {
    const session = recuperarDatosDelSessionStorage();
    if (session.cartId) {
        console.log(`http://localhost:8080/api/carts/${session.cartId}/product/${productId}`);
        $.ajax({
            url: `http://localhost:8080/api/carts/${session.cartId}/product/${productId}`,
            type: "POST",
            success: function (response) {
                console.log(response);
                // alert("¡Formulario enviado con éxito!");
                toast("El producto se agrego al carrito con exito!!", "success", "bottom-right");
                // Manejar la respuesta del servidor
            },
            error: function (error) {
                console.log(error);
                toast("Ha ocurrido un error!!", "error", "bottom-right");
                // Manejar errores de la solicitud
            },
        });
    }
};
