import express from "express";
import { con, upload } from "../utils.js";
import { isUser } from "../middleware/Helper.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";
import e from "express";
import { socketServer } from "../app.js"; // Importa el objeto io desde app.js

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const agendaHtmlRouter = express.Router();

agendaHtmlRouter.get("/recordatorios",isUser, async (req, res) => {
    try {
        const fechaCita = new Date();
        fechaCita.setDate(fechaCita.getDate() + 1);
        const fechaFormateada = fechaCita.toISOString().slice(0, 10);
        //hace un select de los pacientes que tienen cita mañana y pasado mañana y que esa cita no tenga estado 6 (cancelada)
        const maniana = await ejecutarConsulta(`SELECT a.id_agenda, CONCAT(b.nombre_paciente, ' ', b.apellido_paciente) AS nombre, DATE_FORMAT(a.fecha_cita,'%d/%m/%y') AS fecha_cita, DATE_FORMAT(a.fecha_cita,'%H:%i') AS hora, a.comentario_cita AS comentario FROM agenda a, paciente b, agenda_estados c WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6)) AND DATE(a.fecha_cita) = '${fechaFormateada}' ORDER BY a.fecha_cita;`);
        
        return res.status(200).json(maniana);
    } catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
        }
});



agendaHtmlRouter.get("/calendario", isUser, async (req, res) => {
    let json=req.query.json;
    //console.log(json);
    if(json==1){
        
        const citas = await ejecutarConsulta("SELECT  CONCAT(nombre_paciente, ' ', apellido_paciente) AS title, a.comentario_cita AS description, DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s') AS start, DATE_FORMAT(fecha_fin_cita,'%Y-%m-%d %H:%i:%s') AS end ,color ,'#ffffff' AS textColor,a.id_agenda AS id   FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6)) GROUP BY title, a.comentario_cita, DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s'),DATE_FORMAT(fecha_fin_cita,'%Y-%m-%d %H:%i:%s'),color, a.id_agenda;");
        
        //console.log(citas);
        return res.status(200).json(citas);
    }else{
        
        try {
            const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s') AS fecha_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
            const pactadas = await ejecutarConsulta("SELECT count(*) AS pactadas FROM agenda_estados WHERE id_estado = 1");
            const fechaCita = new Date();
            fechaCita.setDate(fechaCita.getDate() + 1);
            const fechaFormateada = fechaCita.toISOString().slice(0, 10);
            const maniana = await ejecutarConsulta(`SELECT count(*) as maniana FROM agenda WHERE DATE(fecha_cita) = '${fechaFormateada}'`);
            const hoy = await ejecutarConsulta(`SELECT count(*) as hoy FROM agenda WHERE DATE(fecha_cita) = CURDATE() AND id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (3,5,6))`);
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
    
    
            return res.status(200).render("calendario", { pacientes: results ,fecha:fecha,maniana:maniana,pactadas:pactadas,hoy:hoy,isUser:req.session.usuario});
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo"});
          }
    }
    

   
});

agendaHtmlRouter.get("/", isUser,async (req, res) => {
    let id=req.query.id;
    if(id){
        try {
            const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s') AS fecha_cita, e.descripcion,b.contacto_paciente,a.primeravez FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda = "+id);          
            return res.status(200).json(results);
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo",error:error});
          }
    }else{
        try {
            const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%H:%i') AS hora, DATE_FORMAT(fecha_cita,'%d/%m/%y') AS fecha_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6) order by fecha_cita);");
            const pactadas = await ejecutarConsulta("SELECT count(*) AS pactadas FROM agenda_estados WHERE id_estado = 1");
            const fechaCita = new Date();
            fechaCita.setDate(fechaCita.getDate() + 1);
            const fechaFormateada = fechaCita.toISOString().slice(0, 10);
            const maniana = await ejecutarConsulta(`SELECT count(*) as maniana FROM agenda WHERE DATE(fecha_cita) = '${fechaFormateada}'`);
            const hoy = await ejecutarConsulta(`SELECT count(*) as hoy FROM agenda WHERE DATE(fecha_cita) = CURDATE() AND id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (3,5,6))`);
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
    
            
            return res.status(200).render("agenda", { agenda: results ,fecha:fecha,maniana:maniana,pactadas:pactadas,hoy:hoy,isUser:req.session.usuario});
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo",error:error});
          }
    }
    

   
});


agendaHtmlRouter.get("/modificar", isUser,async (req, res) => {
    let id=req.query.id;
    console.log(id);
    let agendaydatosdepaciente = await ejecutarConsulta(`SELECT a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%Y-%m-%dT%H:%i:%s') AS fecha_formateada, DATE_FORMAT(fecha_cita,'%Y-%m-%dT%H:%i:%s') AS fecha_cita_formateada, DATE_FORMAT(proxima_cita,'%Y-%m-%dT%H:%i:%s') AS proxima_cita_formateada FROM agenda a, paciente b WHERE a.id_paciente=b.id_paciente AND a.id_agenda=${id}`);
    
    //console.log(agendaydatosdepaciente);
    return res.status(200).render("agendaalta", { agenda: agendaydatosdepaciente });
    //    try {
    //        const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 6, 'Cancelada por el paciente')`);
           
    //        const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
    //         console.log("PACIENTE"+pacientes);
    //        return res.status(200).render("agenda", { pacientes: pacientes });
    //    }  catch (error) {
    //        console.error(error);
    //        return res.status(404).json({msg:"fallo"});
    //      }
       
   });

agendaHtmlRouter.delete("/eliminar", async (req, res) => {
    let id=req.query.id;
       try {
           const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 6, 'Cancelada por el paciente')`);
           
           const agenda = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
            
           return res.status(200).render("agenda", { agenda: agenda });
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });
   agendaHtmlRouter.get("/ensala", isUser,async (req, res) => {
    let id=req.query.id;
       try {
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
            
            //const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 2, 'En sala de espera horario:${fecha}')`);
            //crea un query para obtener los datos del paciente y la fecha de la cita formateada DD/MM/YYYY y hora HH:MM
            const agendaydatosdepaciente = await ejecutarConsulta(`SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%d-%m-%Y %H:%i') AS fecha_cita, DATE_FORMAT(proxima_cita,'%d-%m-%Y %H:%i') AS proxima_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente = b.id_paciente AND a.id_agenda = c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda = ${id}`);
            console.log(agendaydatosdepaciente);
            socketServer.emit('agregarFila', agendaydatosdepaciente);
            
           const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
           
           return res.status(200).render("agenda", { pacientes: pacientes });
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

   agendaHtmlRouter.get("/entaller",isUser, async (req, res) => {
    let id=req.query.id;
       try {
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
            const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 4, 'En Taller horario:${fecha}')`);
              
           const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
           
           return res.status(200).render("agenda", { pacientes: pacientes });
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

agendaHtmlRouter.get("/alta",isUser, async (req, res) => {
    let id=req.query.id;
    if(id){
        let id=req.query.id;
        //console.log(id);
        let agendaydatosdepaciente = await ejecutarConsulta(`SELECT a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%Y-%m-%d %H:%i:%s') AS nacimiento_paciente, DATE_FORMAT(fecha_cita,'%Y-%m-%dT%H:%i:%s') AS fecha_cita_formateada , DATE_FORMAT(proxima_cita,'%Y-%m-%dT%H:%i:%s') AS proxima_cita, color FROM agenda a, paciente b WHERE a.id_paciente=b.id_paciente AND a.id_agenda=${id}`);
        
       // console.log(agendaydatosdepaciente);
        return res.status(200).render("agendaalta", { agenda: agendaydatosdepaciente });
    }else{
        return res.status(200).render("agendaalta");
    }

   
});

// agendaHtmlRouter.get("/:pid", async (req, res) => {
//     let pid = req.params.pid;
//     let agenda = await Service.getById(pid);
//     // let agenda = await Service.getAll();
//     // agenda = agenda.filter((x) => x._id == pid);
//     agenda = JSON.parse(JSON.stringify(agenda));
//     if (agenda.length == 0) {
//         return res.status(404).json({ status: "error", msg: `No se encuentra ningun agendao con el id: ${pid}`, data: agenda });
//     } else {
//         console.log(agenda);
//         return res.status(200).render("home", { agendaos: agenda });
//     }
// });



agendaHtmlRouter.post('/alta',async (req, res) => {
    // console.log(req)
    let obj = req.body;
   // console.log("hola")
    //console.log("ksajhdkjahsd",obj)
    //console.log("obj", JSON.parse(JSON.stringify(obj)));

    const {
      id_agenda,
      fecha_cita,
      fecha_fin_cita,
      comentario_cita,
      nombre_paciente,
      apellido_paciente,
      dni_paciente,
      peso_paciente,
      altura_paciente,
      edad_paciente,
      nacimiento_paciente,
      talle_paciente,
      contacto_paciente,
      email_paciente,
      color_agenda,
      primeravez,
  } = req.body;

  //crea la variable proxima_cita que sea un año despues formato de la fecha tiene que ser asi '2023-07-17 06:30:00'
    let proxima_cita = new Date(fecha_cita);
    proxima_cita.setFullYear(proxima_cita.getFullYear() + 1);
    proxima_cita = proxima_cita.getFullYear() + "-" + (proxima_cita.getMonth() + 1) + "-" + proxima_cita.getDate() + " " + proxima_cita.getHours() + ":" + proxima_cita.getMinutes() + ":" + proxima_cita.getSeconds();
   // console.log("proxima_cita", proxima_cita);

   
  
    
  
    //valida si tiene valor id_agenda
    //io.emit('agregarFila', obj);

    //crea un select donde busque en la tabla agenda si el id_agenda existe

    function isChecked(voriable) {
        
        if(voriable == "on"){
            return 1;
        }else{
            return 0;
        }

      }
      
      // Ejemplo de uso
    let isCheckboxChecked = isChecked(primeravez);
    if( id_agenda == 0 ){

        
        try {
            
            const sqlPacienteExiste = await ejecutarConsulta(`SELECT * FROM paciente WHERE dni_paciente = ${dni_paciente}`);
            //console.log("sqlPacienteExiste", sqlPacienteExiste);
            
            if(sqlPacienteExiste.length > 0 ){
                
                const sqlAgenda = `INSERT INTO agenda (id_paciente, fecha_cita,fecha_fin_cita, proxima_cita, comentario_cita, color,primeravez) VALUES (${sqlPacienteExiste[0].id_paciente}, '${fecha_cita}','${fecha_fin_cita}', '${proxima_cita}', '${comentario_cita}', '${color_agenda}' , ${isCheckboxChecked})`;
                const insertAgenda = await ejecutarConsulta(sqlAgenda);
                console.log('INSERT agenda ');
            }else{
                const insertPaciente = await ejecutarConsulta(`INSERT INTO paciente (nombre_paciente, apellido_paciente, dni_paciente, peso_paciente, altura_paciente, edad_paciente, nacimiento_paciente, talle_paciente, contacto_paciente, email_paciente,comentario_paciente, alergia, diabetico, tobillo, rodilla, cadera, columna, calzados, patologia) VALUES ('${nombre_paciente}', '${apellido_paciente}', ${dni_paciente}, 0, 0,0, '2001-01-01 06:30:00',0, ${contacto_paciente}, 'ejemplo@ejemplo.com','-', '-', '-', '-', '-', '-', '-', '-', '-')`);
                const ultimoPaciente = await ejecutarConsulta("Select max(id_paciente) as ultimopaciente from paciente"); 
                console.log("ultimo : "+ultimoPaciente[0].ultimopaciente);
                const sqlAgenda = `INSERT INTO agenda (id_paciente, fecha_cita , fecha_fin_cita , proxima_cita, comentario_cita, color,primeravez) VALUES (${ultimoPaciente[0].ultimopaciente}, '${fecha_cita}', '${fecha_fin_cita}', '${proxima_cita}', '${comentario_cita}', '${color_agenda}' , ${isCheckboxChecked})`;
                const insertAgenda = await ejecutarConsulta(sqlAgenda);
                console.log('INSERT paciente y agenda');
            }

            
        
            const ultimoAgendaEstados = await ejecutarConsulta("Select max(id_agenda) as ultimoagendaEstados from agenda");
            console.log("ultimo : "+ultimoAgendaEstados[0].ultimoagendaEstados);
            const sqlAgendaEstados = `INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${ultimoAgendaEstados[0].ultimoagendaEstados},1, '');`;
            const insertAgendaEstado = await ejecutarConsulta(sqlAgendaEstados);
            console.log('INSERT agenda_estados');
            
            
           
          } catch (error) {
            console.error('Error al guardar el paciente: ', error);
           
          }

         
        
    }else{
        console.log("entro al else");
        console.log("color_agenda",color_agenda);
        if(color_agenda == undefined){
            console.log("entro al if");
            console.log("fecha_cita",fecha_cita);
            console.log("fecha_fin_cita",fecha_fin_cita);
            console.log("id_agenda",id_agenda);

                //crea un query que updatee la fecha de inicio y de fin de la cita
                let sqlAgendaUpdate = await ejecutarConsulta(`UPDATE agenda SET fecha_cita = '${fecha_cita}',fecha_fin_cita = '${ fecha_fin_cita }' WHERE id_agenda = ${id_agenda}`);
                console.log(`UPDATE agenda SET fecha_cita = '${fecha_cita}',fecha_fin_cita = '${ fecha_fin_cita }' WHERE id_agenda = ${id_agenda}`);
                //const sqlAgendaUpdate = await ejecutarConsulta(`UPDATE agenda SET fecha_cita = '${fecha_cita}',comentario_cita = '${ comentario_cita }',duracion = '${ duracion }' WHERE id_agenda = ${id_agenda}`);
               
            
        }else{
            console.log("entro al else");
            //crea la variable fecha_fin_cita que sea media hora despues que fecha_cita formato de la fecha tiene que ser asi '2023-07-17 06:30:00'
            let fecha_fin_cita = new Date(fecha_cita);
            fecha_fin_cita.setMinutes(fecha_fin_cita.getMinutes() + 30);
            fecha_fin_cita = fecha_fin_cita.getFullYear() + "-" + (fecha_fin_cita.getMonth() + 1) + "-" + fecha_fin_cita.getDate() + " " + fecha_fin_cita.getHours() + ":" + fecha_fin_cita.getMinutes() + ":" + fecha_fin_cita.getSeconds();
            //console.log("fecha_fin_cita",fecha_fin_cita);

            //crea un query que updatee la fecha de inicio y de fin de la cita
        
           


            let sqlAgendaUpdate = await ejecutarConsulta(`UPDATE agenda SET fecha_cita = '${fecha_cita}',fecha_fin_cita = '${fecha_fin_cita}',comentario_cita = '${ comentario_cita }',color ='${ color_agenda}' WHERE id_agenda = ${id_agenda}`);
        }
           
       
            
            //console.log("sqlAgendaUpdate", sqlAgendaUpdate);
        
    }
    
    //socketServer.emit('mensaje', 'Se agrego una cita nueva');
    return res.redirect("/agenda/calendario");

   

    
  });
  

agendaHtmlRouter.delete("/:pid", async (req, res) => {
    let pid = req.params.pid;
    let agenda = await Service.getById(pid);
    agenda = JSON.parse(JSON.stringify(agenda));
    const rutaArchivo = __dirname + "/public/pictures/" + agenda[0].thumbnail;
    let deleteagenda = await Service.deletedOne(pid);
    console.log(deleteagenda);
    if ((deleteagenda.deletedCount = 0)) {
        return res.status(404).json({ status: "error", msg: `No Existe un agendao con ID: ${pid}`, data: {} });
    } else {
        fs.unlink(rutaArchivo, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("No se pudo eliminar el archivo.");
            }
        });
        let allagendaos = await Service.getAll();
        allagendaos = JSON.parse(JSON.stringify(allagendaos));
        console.log("allagendaos", allagendaos);
        return res.status(200).render("home", { agendaos: allagendaos });
    }
});

agendaHtmlRouter.put("/:pid", async (req, res) => {
    let pid = req.params.pid;
    let obj = req.body;
    let agenda = await Service.updateOne(pid, obj.agenda);
    if (agenda) {
        let agenda = await Service.getAll();
        agenda = JSON.parse(JSON.stringify(agenda));
        return res.status(200).render("home", { agendaos: agenda });
    } else {
        return res.status(404).json({ status: "error", msg: `No Existe un agendao con ID: ${pid}`, data: {} });
    }
});