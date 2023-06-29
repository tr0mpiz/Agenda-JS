import express from "express";
import { con, uploader } from "../utils.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const agendaHtmlRouter = express.Router();



agendaHtmlRouter.get("/calendario", async (req, res) => {
    let json=req.query.json;
    console.log(json);
    if(json==1){
        
        const citas = await ejecutarConsulta("SELECT  CONCAT(nombre_paciente, ' ', apellido_paciente) AS title, a.comentario_cita AS description, DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s') AS start, DATE_ADD(DATE_FORMAT(fecha_cita,'%Y-%m-%d %H:%i:%s'), INTERVAL 30 MINUTE) AS end ,color ,'#ffffff' AS textColor   FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
        console.log(citas);
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
    
    
            return res.status(200).render("calendario", { pacientes: results ,fecha:fecha,maniana:maniana,pactadas:pactadas,hoy:hoy});
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo"});
          }
    }
    

   
});

agendaHtmlRouter.get("/", async (req, res) => {
    
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
    
    
            return res.status(200).render("agenda", { agenda: results ,fecha:fecha,maniana:maniana,pactadas:pactadas,hoy:hoy});
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo",error:error});
          }
    
    

   
});

agendaHtmlRouter.get("/modificar", async (req, res) => {
    let id=req.query.id;
    console.log(id);
    let agendaydatosdepaciente = await ejecutarConsulta(`SELECT a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%Y-%m-%dT%H:%i:%s') AS fecha_formateada, DATE_FORMAT(fecha_cita,'%Y-%m-%dT%H:%i:%s') AS fecha_cita_formateada, DATE_FORMAT(proxima_cita,'%Y-%m-%dT%H:%i:%s') AS proxima_cita_formateada FROM agenda a, paciente b WHERE a.id_paciente=b.id_paciente AND a.id_agenda=${id}`);
    
    console.log(agendaydatosdepaciente);
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
   agendaHtmlRouter.get("/ensala", async (req, res) => {
    let id=req.query.id;
       try {
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
            const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 2, 'En sala de espera horario:${fecha}')`);
              
           const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
           
           return res.status(200).render("agenda", { pacientes: pacientes });
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

agendaHtmlRouter.get("/alta", async (req, res) => {
    let id=req.query.id;
    if(id){
        let id=req.query.id;
        console.log(id);
        let agendaydatosdepaciente = await ejecutarConsulta(`SELECT a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%Y-%m-%dT%H:%i:%s') AS nacimiento_paciente, DATE_FORMAT(fecha_cita,'%Y-%m-%dT%H:%i:%s') AS fecha_cita_formateada , DATE_FORMAT(proxima_cita,'%Y-%m-%dT%H:%i:%s') AS proxima_cita, color FROM agenda a, paciente b WHERE a.id_paciente=b.id_paciente AND a.id_agenda=${id}`);
        
        console.log(agendaydatosdepaciente);
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
    
    let obj = req.body;
    //console.log("obj", obj);
    
    const {
      id_agenda,
      fecha_cita,
      proxima_cita,
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
      color_agenda
  } = req.body;
    //valida si tiene valor id_agenda
    
    //crea un select donde busque en la tabla agenda si el id_agenda existe
    const sqlAgendaExiste = await ejecutarConsulta(`SELECT * FROM agenda WHERE id_agenda = ${id_agenda}`);
   
    if( id_agenda == 0 ){

        
        try {
            console.log("entro al try");
            const sqlPacienteExiste = await ejecutarConsulta(`SELECT * FROM paciente WHERE dni_paciente = ${dni_paciente}`);
            
            
            if(sqlPacienteExiste.length > 0 ){
                
                const sqlAgenda = `INSERT INTO agenda (id_paciente, fecha_cita, proxima_cita, comentario_cita, color) VALUES (${sqlPacienteExiste[0].id_paciente}, '${fecha_cita}', '${proxima_cita}', '${comentario_cita}', '${color_agenda}')`;
                const insertAgenda = await ejecutarConsulta(sqlAgenda);
                console.log('INSERT agenda ');
            }else{
                const insertPaciente = await ejecutarConsulta(`INSERT INTO paciente (nombre_paciente, apellido_paciente, dni_paciente, peso_paciente, altura_paciente, edad_paciente, nacimiento_paciente, talle_paciente, contacto_paciente, email_paciente) VALUES ('${nombre_paciente}', '${apellido_paciente}', ${dni_paciente}, ${peso_paciente}, ${altura_paciente}, ${edad_paciente}, '${nacimiento_paciente}', ${talle_paciente}, ${contacto_paciente}, '${email_paciente}')`);
                const ultimoPaciente = await ejecutarConsulta("Select max(id_paciente) as ultimopaciente from paciente"); 
                console.log("ultimo : "+ultimoPaciente[0].ultimopaciente);
                const sqlAgenda = `INSERT INTO agenda (id_paciente, fecha_cita, proxima_cita, comentario_cita, color) VALUES (${ultimoPaciente[0].ultimopaciente}, '${fecha_cita}', '${proxima_cita}', '${comentario_cita}', '${color_agenda}')`;
                const insertAgenda = await ejecutarConsulta(sqlAgenda);
                console.log('INSERT paciente y agenda');
            }

            
        
            const ultimoAgendaEstados = await ejecutarConsulta("Select max(id_agenda) as ultimoagendaEstados from agenda");
            console.log("ultimo : "+ultimoAgendaEstados[0].ultimoagendaEstados);
            const sqlAgendaEstados = `INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${ultimoAgendaEstados[0].ultimoagendaEstados},1, '');`;
            const insertAgendaEstado = await ejecutarConsulta(sqlAgendaEstados);
            console.log('INSERT agenda_estados');
            
            
            try {
                const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
                //console.log(results);
                //redirecciona a
                return res.status(200).render("agendaalta", { agenda: results});
            }  catch (error) {
                console.error(error);
                return res.status(404).json({msg:"fallo"});
              }
          } catch (error) {
            console.error('Error al guardar el paciente: ', error);
           
          }
        
    }else{
        console.log("entro al else");
            const sqlAgendaUpdate = await ejecutarConsulta(`UPDATE agenda SET fecha_cita = '${fecha_cita}', proxima_cita = '${proxima_cita}', comentario_cita = '${comentario_cita}', color='${color_agenda}' WHERE id_agenda = ${id_agenda}`);
            const sqlPacienteUpdate = await ejecutarConsulta(`UPDATE paciente SET nombre_paciente = '${nombre_paciente}', apellido_paciente = '${apellido_paciente}', dni_paciente = ${dni_paciente}, peso_paciente = ${peso_paciente}, altura_paciente = ${altura_paciente}, edad_paciente = ${edad_paciente}, nacimiento_paciente = '${nacimiento_paciente}', talle_paciente = ${talle_paciente}, contacto_paciente = ${contacto_paciente}, email_paciente = '${email_paciente}' WHERE id_paciente = ${sqlAgendaExiste[0].id_paciente}`);
            console.log(`UPDATE agenda SET fecha_cita = '${fecha_cita}', proxima_cita = '${proxima_cita}', comentario_cita = '${comentario_cita}' WHERE id_agenda = ${id_agenda}`);
            console.log("sqlAgendaUpdate", sqlAgendaUpdate);
        try {
            const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,3,5,6));");
            //console.log(results);
          
            return res.status(200).render("agenda", { agenda: results});
        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo"});
          }
    }

    

   

    
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