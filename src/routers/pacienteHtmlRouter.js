import express from "express";
import { con, uploader } from "../utils.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";
import { isUser } from "../middleware/Helper.js";

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const pacienteHtmlRouter = express.Router();

//const Service = new agendaService();
pacienteHtmlRouter.post('/guardar-dibujo', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const fileName = 'dibujo.png';
    const filePath = path.join(__dirname, fileName);
  
    fs.writeFile(filePath, base64Data, 'base64', err => {
      if (err) {

        console.error('Error al guardar el dibujo en el servidor:', err);
        //esperar 5 segundos antes de responder
        setTimeout(() => {
            res.status(500).json({ error: 'Error al guardar el dibujo en el servidor' });
        }, 5000);
      } else {
        console.log('Dibujo guardado en el servidor:', filePath);
        res.json({ message: 'Dibujo guardado correctamente' });
      }
    });
  });

pacienteHtmlRouter.get("/alta", isUser, async (req, res) => {
    try {
        const results = await ejecutarConsulta('select * from paciente');
        
        return res.status(200).render("pacientealta", { pacientes: results });
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/", async (req, res) => {
    let dni=req.query.dni;
    
    if (dni) {
        try {
            const paciente = await ejecutarConsulta(`SELECT DATE_FORMAT(nacimiento_paciente, '%Y-%m-%dT%H:%i:%s') AS nacimiento_paciente,nombre_paciente,apellido_paciente,contacto_paciente  FROM paciente WHERE dni_paciente = '${dni}'`);
            console.log(paciente);
            return res.status(200).json(paciente);
        }  catch (error) {
            console.log("nno");
            return res.status(404).json({msg:"No encontrado"});
          }
    }
    try {
       
        const results = await ejecutarConsulta("SELECT DATE_FORMAT(nacimiento_paciente, '%d/%m/%Y') AS nacimiento_paciente, paciente.* FROM paciente");
        console.log(results);

        return res.status(200).render("paciente", { pacientes: results });
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/siguiente", async (req, res) => {
    try {
        const pactadas = await ejecutarConsulta("SELECT count(*) AS pactadas FROM agenda_estados WHERE id_estado = 1");
        const ensala = await ejecutarConsulta("SELECT count(*) AS ensala FROM agenda_estados WHERE id_estado = 2");
        
        const fechaCita = new Date();
        fechaCita.setDate(fechaCita.getDate() + 1);
        const fechaFormateada = fechaCita.toISOString().slice(0, 10);
        const maniana = await ejecutarConsulta(`SELECT count(*) as maniana FROM agenda WHERE DATE(fecha_cita) = '${fechaFormateada}'`);
        const hoy = await ejecutarConsulta(`SELECT count(*) as hoy FROM agenda WHERE DATE(fecha_cita) = CURDATE()`);

        const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%d-%m-%Y %H:%i') AS fecha_cita, DATE_FORMAT(proxima_cita,'%d-%m-%Y %H:%i') AS proxima_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente = b.id_paciente AND a.id_agenda = c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado = 6) AND c.id_estado =2;");
        console.log(results);
        
        return res.status(200).render("proximo", { pacientes: results,pactadas:pactadas,maniana:maniana,hoy:hoy,ensala:ensala });
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/taller", async (req, res) => {
    let id=req.query.id;
       try {
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
            const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 4, 'Se envio a taller :${fecha}')`);
              
           const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2));");
           
           return res.status(200).render("/proximo", { pacientes: pacientes });
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

pacienteHtmlRouter.get("/consulta", async (req, res) => {
 let id=req.query.id;
    try {
       
        const results = await ejecutarConsulta("SELECT DATE_FORMAT(nacimiento_paciente, '%d/%m/%Y') AS fecha_formateada_nacimiento, paciente.* FROM paciente WHERE id_paciente="+id);
         //
        
        return res.status(200).render("pacientealta", { paciente: results,modificar:false});
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }
    
});

pacienteHtmlRouter.get("/modificar", async (req, res) => {
    let id=req.query.id;

       try {
          
           let query = `SELECT DATE_FORMAT(nacimiento_paciente, '%Y-%m-%d') AS fecha_formateada_nacimiento, paciente.* FROM paciente`;
           if (id) {
               query = query + ` WHERE id_paciente=${id}`;
           }else{
              if (req.query.dni) {
                  query = query + ` WHERE dni_paciente=${req.query.dni}`;
              }
           }
           const results = await ejecutarConsulta(query);

            //
           
           return res.status(200).render("pacientealta", { paciente: results ,modificar:true});
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

pacienteHtmlRouter.post("/alta", async (req, res) => {

    let obj = req.body;
    console.log("obj", obj);

    const {
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
        id_paciente

      } = req.body;
      
      if(id_paciente){  
        console.log("modificando paciente");
        const sql = `UPDATE paciente SET nombre_paciente='${nombre_paciente}', apellido_paciente='${apellido_paciente}', dni_paciente=${dni_paciente}, peso_paciente=${peso_paciente}, altura_paciente=${altura_paciente}, edad_paciente=${edad_paciente}, nacimiento_paciente='${nacimiento_paciente}', talle_paciente=${talle_paciente}, contacto_paciente='${contacto_paciente}', email_paciente='${email_paciente}' WHERE id_paciente=${id_paciente}`;
        console.log(sql);
        try {
            const v = await ejecutarConsulta(sql);
            console.log('Paciente modificado correctamente');
            //recarga la pagina para que se vea el nuevo paciente
            return res.status(200).redirect("/paciente/");

        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo"});
            }
        }else{
            console.log("guardando paciente");
            const sql = `INSERT INTO paciente (id_paciente, nombre_paciente, apellido_paciente, dni_paciente, peso_paciente, altura_paciente, edad_paciente, nacimiento_paciente, talle_paciente, contacto_paciente, email_paciente) VALUES (0, '${nombre_paciente}', '${apellido_paciente}', ${dni_paciente}, ${peso_paciente}, ${altura_paciente}, ${edad_paciente}, '${nacimiento_paciente}', ${talle_paciente}, '${contacto_paciente}', '${email_paciente}')`;
            
            console.log(sql);
            try {
                const v = await ejecutarConsulta(sql);
                console.log('Paciente guardado correctamente');
                try {
                    const results = await ejecutarConsulta('select * from paciente');
                    console.log(results);
                    let rest=1;
                    let links="www.google.com.ar";
                    return res.status(200).render("paciente", { pacientes: results, pagination: rest, links });
                }  catch (error) {
                    console.error(error);
                    return res.status(404).json({msg:"fallo"});
                }
            } catch (error) {
                console.error('Error al guardar el paciente: ', error);
            
            }
        }
      
  
  });


pacienteHtmlRouter.post("/imagen", uploader.single("thumbnail"), async (req, res) => {
    let obj = req.body;
    console.log("obj", obj);

    const file = req.file;
    if (!file) {
        return res.status(400).json({ status: "error", msg: "No se ha cargado ninguna imagen" });
    }

    // let respuesta = await agendao.addagenda(obj.title, obj.description, obj.price, file.filename, obj.code, obj.stock, obj.status, obj.category);
    console.log("carga", obj.title, obj.description, obj.price, file.filename, obj.code, obj.stock, obj.status, obj.category);
    let respuesta = await Service.createOne(obj.title, obj.description, obj.price, file.filename, obj.code, obj.stock, obj.status, obj.category);

    if (respuesta.state) {
        // let agendaos = await agendao.getagendaById(respuesta.id);
        let agendaos = await Service.getById(respuesta._id);
        console.log("byId", agendaos);
        return res.status(200).json({ status: "success", msg: "El agendao fue creado con éxito", data: agendaos.agendao });
    } else {
        return res.status(404).json({ status: "error", msg: "El agendao no se pudo crear", data: {} });
    }
});

pacienteHtmlRouter.delete("/:pid", async (req, res) => {
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

pacienteHtmlRouter.put("/:pid", async (req, res) => {
    let obj = req.body;
    console.log("obj", obj);
    console.log("PUT");
    const {
        
      } = req.body;
    
    // let pid = req.params.pid;
    // let obj = req.body;
    // let agenda = await Service.updateOne(pid, obj.agenda);
    // if (agenda) {
    //     let agenda = await Service.getAll();
    //     agenda = JSON.parse(JSON.stringify(agenda));
    //     return res.status(200).render("home", { agendaos: agenda });
    // } else {
    //     return res.status(404).json({ status: "error", msg: `No Existe un agendao con ID: ${pid}`, data: {} });
    // }
});