import express from "express";
import { con, upload } from "../utils.js";
import fs from "fs";
import { __dirname, __filename,ejecutarConsulta } from "../utils.js";

//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const loginHtmlRouter = express.Router();

//const Service = new agendaService();

loginHtmlRouter.get("/", async (req, res) => {
    try {
        const results = await ejecutarConsulta("select a.*,b.* from agenda a, paciente b Where a.id_paciente = b.id_paciente;");
        //console.log(results);
        return res.status(200).render("login", { pacientes: results});
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

loginHtmlRouter.get("/alta", async (req, res) => {
        return res.status(200).render("usuarioalta");
});

loginHtmlRouter.get("/logout", async (req, res) => {
    req.session.usuario = null;
    req.session.id_usuario = null;
    req.session.nombre = null;
    req.session.apellido = null;
    req.session.permisos = null;
    req.session.destroy();
    return res.redirect("/login");

});



loginHtmlRouter.post('/',async (req, res) => {
   
    let obj = req.body;
    
    
    const {
        email,
        password,
      
    } = req.body;

    const sqlInsert = `SELECT * FROM usuarios WHERE correo = '${email}'`;
  
   try {
        
        const insertAgenda = await ejecutarConsulta(sqlInsert);
        //controla si recibi informacion de la base de datos
        if (insertAgenda.length == 0) {
            return res.status(200).render("login", { usuario: insertAgenda , status: "error", msg: `No se encuentra ningun Usuario con Email : ${email}` });
            
        }else{
            if (insertAgenda[0].correo != email) {
                return res.status(200).render("login", { usuario: insertAgenda, status: "error", msg: `Email o contraseña incorrecto.`});
               
            }else{
                //controla si la contraseña es correcta
                if (insertAgenda[0].contrasena != password) {
                    return res.status(200).render("login", { usuario: insertAgenda, status: "error", msg: `Email o contraseña incorrecto.`});
                    
                }else{
                
                    //controla si el usuario esta activo
                    if (insertAgenda[0].baja != 0) {
                        return res.status(200).render("login", { usuario: insertAgenda, status: "error", msg: `Usuario Eliminado : ${email}`});
                    }else{
                        //ingresa al sistema
                       
                        req.session.usuario = insertAgenda[0].correo;
                        req.session.id_usuario = insertAgenda[0].id;
                        req.session.nombre = insertAgenda[0].nombre;
                        req.session.apellido = insertAgenda[0].apellido;
                        // req.session.permisos = insertAgenda[0].permisos;
                        req.session.correo = insertAgenda[0].correo;
                        //no tiene expiracion la sesion
                        req.session.cookie.expires = new Date(Date.now() + (1000 * 60 * 60 * 24 * 365 * 10));
                        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 365 * 10;
                        
                        //crea un archivo .log con la informacion de la sesion si no existe la carpeta la crea
                        if (!fs.existsSync(__dirname + "/public/logs/")) {
                            fs.mkdirSync(__dirname + "/public/logs/");
                        }
                        fs.appendFileSync(__dirname + "/public/logs/" + req.session.id_usuario + ".log", "Sesion iniciada con exito en el horario por el usuario : " + req.session.cookie.expires + " " + req.session.usuario + "\n");
                        
                       //re
                        return res.status(200).redirect('/agenda');
                        // return res.redirect('/agenda?usuario=' + encodeURIComponent(JSON.stringify(insertAgenda)) + '&isUser=true');

                    }
                    
                }   
            }
        }
        //controla si el usuario existe
        
    } catch (error) {
        console.error('Error al guardar el paciente: ', error);
    
    }

    
  });
  

loginHtmlRouter.delete("/:pid", async (req, res) => {
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

loginHtmlRouter.put("/:pid", async (req, res) => {
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