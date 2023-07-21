

const asignarProximaCita = () => {
    const inputFechaCita = document.getElementById('fecha_cita');
    const inputProximaCita = document.getElementById('proxima_cita');
    const inputNacimiento_paciente = document.getElementById('nacimiento_paciente');
    
    // pone el valor de inputFechaCita en inputProximaCita pero sumale un año
    inputProximaCita.value = inputFechaCita.value;
    inputProximaCita.value = moment(inputProximaCita.value).add(1, 'years').format('YYYY-MM-DD HH:MM:SS');

    inputNacimiento_paciente.value = inputFechaCita.value;
    
  }


  const peticionAjax = (url, method, reload) => {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: method,
        url: url,
        // data: formData,
        success: function (response) {
          if (reload == "true") {
            console.log(reload)
            window.location.reload();
            console.log("recarga la pagina")
          } else {
            console.log(reload)
            console.log("NO la pagina")
            resolve(response);
          }
        },
        error: function (xhr, status, error) {
          console.log(error);
          toast("Ha ocurrido un error!!", "error", "bottom-right");
          reject(error);
        },
      });
    });
  };

//crea una funcion para que cuando el campo dni_paciente cambie se ejecute la funcion peticonAjax con el metodo get
const dni_paciente = document.getElementById('dni_paciente');
if(dni_paciente){

dni_paciente.addEventListener('change', async () =>{
    const url = `/paciente/?dni=${dni_paciente.value}`;
    const method = 'GET';
    const reload = false;
    const inputNombre_paciente = document.getElementById('nombre_paciente');
    const inputApellido_paciente = document.getElementById('apellido_paciente');
    const inputcontacto_paciente = document.getElementById('contacto_paciente');

    const paciente = await peticionAjax(url,method,reload);

        if(paciente.length == 0){
            console.log(paciente);
            //crea una fecha con este formato 2023-06-30T00:00:00 con javascript
            const fechayhora = new Date().toISOString().slice(0, 19).replace('T', ' ');
            inputNacimiento_paciente.value = fechayhora;

        }else{
            console.log(paciente);
            inputNombre_paciente.value = paciente[0].nombre_paciente;
            inputApellido_paciente.value = paciente[0].apellido_paciente;
            inputcontacto_paciente.value = paciente[0].contacto_paciente;
            
            //pone todo los campos en solo lectura
            inputNombre_paciente.readOnly = true;
            inputApellido_paciente.readOnly = true;
        }
    });

}








