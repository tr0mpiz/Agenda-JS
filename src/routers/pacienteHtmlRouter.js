import express from "express";
import { uploader } from "../utils.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const pacienteHtmlRouter = express.Router();

//const Service = new agendaService();

pacienteHtmlRouter.get("/", async (req, res) => {
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

   
});

pacienteHtmlRouter.get("/:pid", async (req, res) => {
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

pacienteHtmlRouter.post("/", uploader.single("thumbnail"), async (req, res) => {

    let obj = req.body;
    console.log("obj", obj);

    
    const {
        paciente_nombre,
        paciente_apellido,
        paciente_dni,
        paciente_peso,
        paciente_altura,
        paciente_edad,
        paciente_nacimiento,
        paciente_talle,
        paciente_contacto,
        paciente_email
      } = req.body;
    
      const sql = `INSERT INTO paciente  VALUES (0,'${paciente_nombre}', '${paciente_apellido}', '${paciente_dni}', '${paciente_peso}', '${paciente_altura}', '${paciente_edad}', '${paciente_nacimiento}', '${paciente_talle}', '${paciente_contacto}', '${paciente_email}')`;
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