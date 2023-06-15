import express from "express";
import { uploader } from "../utils.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const agendaHtmlRouter = express.Router();

//const Service = new agendaService();

agendaHtmlRouter.get("/", async (req, res) => {
    try {
        const results = await ejecutarConsulta('select * from paciente');
        console.log(results);
        let rest=1;
        let links="www.google.com.ar";
        return res.status(200).render("agenda", { pacientes: results, pagination: rest, links });
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

agendaHtmlRouter.get("/:pid", async (req, res) => {
    let pid = req.params.pid;
    let agenda = await Service.getById(pid);
    // let agenda = await Service.getAll();
    // agenda = agenda.filter((x) => x._id == pid);
    agenda = JSON.parse(JSON.stringify(agenda));
    if (agenda.length == 0) {
        return res.status(404).json({ status: "error", msg: `No se encuentra ningun agendao con el id: ${pid}`, data: agenda });
    } else {
        console.log(agenda);
        return res.status(200).render("home", { agendaos: agenda });
    }
});


agendaHtmlRouter.post('/insertar', (req, res) => {
    let obj = req.body;
    console.log("obj", obj);
    const {
      id_agenda,
      id_paciente,
      fecha_cita,
      proxima_cita,
      comentario_cita,
      nombre_paciente,
      apellido_paciente,
      dni_paciente,
      peso_paciente,
      altura_paciente
    } = req.body;
  
    const sqlAgenda = `INSERT INTO agenda (id_agenda, id_paciente, fecha_cita, proxima_cita, comentario_cita) VALUES (${id_agenda}, ${id_paciente}, '${fecha_cita}', '${proxima_cita}', '${comentario_cita}')`;
  
    const sqlPaciente = `INSERT INTO paciente (id_paciente, nombre_paciente, apellido_paciente, dni_paciente, peso_paciente, altura_paciente) VALUES (${id_paciente}, '${nombre_paciente}', '${apellido_paciente}', ${dni_paciente}, ${peso_paciente}, ${altura_paciente})`;
  
    connection.query(sqlAgenda, (err, result) => {
      if (err) {
        console.error('Error al ejecutar la consulta de inserción en la tabla "agenda": ', err);
        res.status(500).send('Error al ejecutar la consulta de inserción en la tabla "agenda"');
      } else {
        connection.query(sqlPaciente, (err, result) => {
          if (err) {
            console.error('Error al ejecutar la consulta de inserción en la tabla "paciente": ', err);
            res.status(500).send('Error al ejecutar la consulta de inserción en la tabla "paciente"');
          } else {
            console.log('Registros insertados correctamente en las tablas "agenda" y "paciente"');
            res.send('Registros insertados correctamente en las tablas "agenda" y "paciente"');
          }
        });
      }
    });
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