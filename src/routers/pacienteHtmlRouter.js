import express from "express";
import fs from "fs";
import path from "path";
import { isUser } from "../middleware/Helper.js";
import { __dirname, con, ejecutarConsulta } from "../utils.js";



//import { agendaService } from "../services/agenda.services.js";
//import { agendaModel } from "../DAO/models/agenda.model.js";

export const pacienteHtmlRouter = express.Router();

pacienteHtmlRouter.post("/imagen", (req, res) => {
    const { img, name } = req.body;
    const fecha = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }).replace(/:/g, "-").replace(/\./g, "-").replace(/\//g, "-").replace(/,/g, "");
    const pngBuffer = Buffer.from(img, "base64");
    // const image = obj.image;
    const nombreArchivo = `Plantilla_${fecha}.png`;
    const rutaCarpetaArchivos = path.join(__dirname, `/public/storage/${name}`);
    const rutaArchivo = path.join(rutaCarpetaArchivos, nombreArchivo);
    // Verifica si la carpeta existe
    console.log("rutaCarpetaArchivos");
    console.log(rutaCarpetaArchivos);
    if (!fs.existsSync(rutaCarpetaArchivos)) {
        // Si la carpeta no existe, créala
        fs.mkdirSync(rutaCarpetaArchivos, { recursive: true });
    }

    // Guarda el archivo en el servidor
    fs.writeFile(rutaArchivo, pngBuffer, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: "error", msg: "Error al guardar el archivo" });
        }

        return res.status(200).json({ status: "success", msg: `Producto con el id: ${name} guardado en el servidor` });
    });
});



pacienteHtmlRouter.get("/alta", isUser, async (req, res) => {
    try {
        const results = await ejecutarConsulta('select * from paciente');
        
        return res.status(200).render("pacientealta", { pacientes: results,isUser:req.session.usuario });
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/", isUser, async (req, res) => {
    let dni=req.query.dni;
    
    if (dni) {
        try {
            const paciente = await ejecutarConsulta(`SELECT DATE_FORMAT(nacimiento_paciente, '%Y-%m-%dT%H:%i:%s') AS nacimiento_paciente,nombre_paciente,apellido_paciente,contacto_paciente  FROM paciente WHERE dni_paciente = '${dni}'`);
            //console.log(paciente);
            return res.status(200).json(paciente);
        }  catch (error) {
            console.log("nno");
            return res.status(404).json({msg:"No encontrado"});
          }
    }
    try {
       
        const results = await ejecutarConsulta("SELECT DATE_FORMAT(nacimiento_paciente, '%d/%m/%Y') AS nacimiento_paciente, paciente.* FROM paciente");
        //console.log(results);

        return res.status(200).render("paciente", { pacientes: results ,isUser:req.session.usuario});
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/siguiente", isUser, async (req, res) => {
    
    try {
        const fechaCita2 = new Date();  
        fechaCita2.setDate(fechaCita2.getDate() + 365);
        const fechaFormateada2 = fechaCita2.toISOString().slice(0, 10);
        const pactadas = await ejecutarConsulta("SELECT count(*) AS pactadas FROM agenda_estados a, agenda b WHERE a.id_agenda = b.id_agenda AND id_estado = 1 AND id_estado IN (6,5,4,3,2) AND fecha_cita < "+fechaFormateada2);
        
        //crea la constate ensala que cuente los pacientes que estan en sala de espera pero que no hayan estado en estado 4,5,6
        const ensala = await ejecutarConsulta("SELECT count(*) AS ensala FROM agenda_estados WHERE id_estado = 2 AND id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6,3,4,5) )");
        
        const fechaCita = new Date();
        fechaCita.setDate(fechaCita.getDate() + 1);
        const fechaFormateada = fechaCita.toISOString().slice(0, 10);
        const maniana = await ejecutarConsulta(`SELECT count(*) as maniana FROM agenda WHERE DATE(fecha_cita) = '${fechaFormateada}' AND id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6,3,4,5) )`);
        const hoy = await ejecutarConsulta(`SELECT count(*) as hoy FROM agenda WHERE DATE(fecha_cita) = CURDATE() AND id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6,3,4,5,2) )`);

        const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%d-%m-%Y %H:%i') AS fecha_cita, DATE_FORMAT(proxima_cita,'%d-%m-%Y %H:%i') AS proxima_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente = b.id_paciente AND a.id_agenda = c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (6,3,4,5) ) AND c.id_estado =2;");
        //trae los pacientes que tienen estado 2 y no hayan tenido estado 6
        // const results = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(fecha_cita,'%d-%m-%Y %H:%i') AS fecha_cita, DATE_FORMAT(proxima_cita,'%d-%m-%Y %H:%i') AS proxima_cita, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente = b.id_paciente AND a.id_agenda = c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado NOT IN (6,3,4,5) ) AND c.id_estado =2;");

        //console.log(results);
        
        return res.status(200).render("proximo", { pacientes: results,pactadas:pactadas,maniana:maniana,hoy:hoy,ensala:ensala ,isUser:req.session.usuario});
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }

   
});

pacienteHtmlRouter.get("/taller",  isUser,async (req, res) => {
    let id=req.query.id;
       try {
            let fecha = new Date();
            // formate la fecha en dd/mm/yyyy hh:mm:ss
            fecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear() + " " + fecha.getHours() + ":" + fecha.getMinutes() ;
            const insertagendaestados = await ejecutarConsulta(`INSERT INTO agenda_estados (id_agenda, id_estado, observacion) VALUES (${id}, 4, 'Se envio a taller :${fecha}')`);
              
           const pacientes = await ejecutarConsulta("SELECT c.*, a.*, b.*, DATE_FORMAT(nacimiento_paciente,'%d/%m/%Y') AS fecha_formateada, e.descripcion FROM agenda a, paciente b, agenda_estados c, estados e WHERE a.id_paciente=b.id_paciente AND a.id_agenda=c.id_agenda AND c.id_estado=e.id_estado AND a.id_agenda NOT IN (SELECT id_agenda FROM agenda_estados WHERE id_estado IN (2,6));");
           
           return res.status(200).render("/proximo", { pacientes: pacientes ,isUser:req.session.usuario});
       }  catch (error) {
           console.error(error);
           return res.status(404).json({msg:"fallo"});
         }
       
   });

pacienteHtmlRouter.get("/consulta",  isUser,async (req, res) => {
 let id=req.query.id;
    try {
       
        const results = await ejecutarConsulta("SELECT DATE_FORMAT(nacimiento_paciente, '%d/%m/%Y') AS fecha_formateada_nacimiento, paciente.* FROM paciente WHERE id_paciente="+id);
         //
        
        return res.status(200).render("pacientealta", { paciente: results,modificar:false,isUser:req.session.usuario});
    }  catch (error) {
        console.error(error);
        return res.status(404).json({msg:"fallo"});
      }
    
});

pacienteHtmlRouter.get("/modificar", isUser, async (req, res) => {
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
           const paciente = await ejecutarConsulta(query);
            
    
            const queryCitasConDni_paciente = `Select a.*,b.*,c.*,d.*,DATE_FORMAT(fecha_cita,'%d-%m-%Y') AS fecha, DATE_FORMAT(fecha_cita,'%H:%i') AS hora FROM agenda a,estados b, agenda_estados c,paciente d WHERE a.id_agenda = c.id_agenda AND   c.id_estado = b.id_estado AND   a.id_paciente = d.id_paciente AND dni_paciente = ${req.query.dni} ORDER BY fecha,hora DESC`;
                //ejecuta el query
             //ahora traeme la cantidad de citas pactadas y que hayan estado en sala de espera
            const pactadas = await ejecutarConsulta(`SELECT COUNT(*) AS pactadas FROM agenda a, agenda_estados b WHERE a.id_agenda = b.id_agenda AND b.id_estado = 2 AND a.id_paciente = ${paciente[0].id_paciente}`);
            //ahora busca la cita mas actual y dame la fecha de la proxima cita
            const proximacita = await ejecutarConsulta(`SELECT DATE_FORMAT(proxima_cita,'%d-%m-%Y') AS proxima_cita FROM agenda WHERE id_paciente = ${paciente[0].id_paciente} ORDER BY proxima_cita DESC LIMIT 1`);
             console.log("proximacita",proximacita);
             console.log("pactadas",pactadas);  
            const citas = await ejecutarConsulta(queryCitasConDni_paciente);
            console.log("citas",citas);
            // crea una constante que tenga los archivos de la carpeta storage/req.query.dni y que sean .png
            const rutaCarpetaArchivos = path.join(__dirname, `/public/storage/${req.query.dni}`);
            //crea la carpeta si no existe
            console.log(__dirname)
            if (!fs.existsSync(rutaCarpetaArchivos)) {
                fs.mkdirSync(rutaCarpetaArchivos);
            }
            //lee los archivos de la carpeta que sean.p[ng ] y guarda en files con clave = url y valor = nombre del archivo
            const files = fs.readdirSync(rutaCarpetaArchivos).filter(file => path.extname(file) === '.png').map(file => {
                return {
                    dni: req.query.dni,
                    nombre: file
                }
            });

            
            console.log("files",files);
            console.log("rutaCarpetaArchivos",rutaCarpetaArchivos);
            
            //
           
           return res.status(200).render("pacientealta", { paciente,modificar:true,files,rutaCarpetaArchivos,isUser:req.session.usuario,citas,pactadas,proximacita});
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
        id_paciente,
        comentario_paciente,
        alergia,
        diabetico,
        tobillo,
        rodilla,
        cadera,
        columna,
        calzados,
        patologia

      } = req.body;
      
      if(id_paciente){  
        console.log("modificando paciente");
        const sql = `UPDATE paciente SET nombre_paciente='${nombre_paciente}', apellido_paciente='${apellido_paciente}', dni_paciente=${dni_paciente}, peso_paciente=${peso_paciente}, altura_paciente=${altura_paciente}, edad_paciente=${edad_paciente}, nacimiento_paciente='${nacimiento_paciente}', talle_paciente=${talle_paciente}, contacto_paciente='${contacto_paciente}', email_paciente='${email_paciente}', comentario_paciente='${comentario_paciente}', alergia='${alergia}', diabetico='${diabetico}', tobillo='${tobillo}', rodilla='${rodilla}', cadera='${cadera}', columna='${columna}', calzados='${calzados}', patologia='${patologia}' WHERE id_paciente=${id_paciente}`;
        console.log(sql);
        try {
            const v = await ejecutarConsulta(sql);
            console.log('Paciente modificado correctamente');
            //recarga la pagina para que se vea el nuevo paciente
            // que redireccione 2 paginas atras y un estado 200
            return res.status(200).redirect('back');

        }  catch (error) {
            console.error(error);
            return res.status(404).json({msg:"fallo"});
            }
        }else{
            console.log("guardando paciente");
            const sql = `INSERT INTO paciente ( nombre_paciente, apellido_paciente, dni_paciente, peso_paciente, altura_paciente, edad_paciente, nacimiento_paciente, talle_paciente, contacto_paciente, email_paciente,comentario_paciente, alergia, diabetico, tobillo, rodilla, cadera, columna, calzados, patologia) VALUES ( '${nombre_paciente}', '${apellido_paciente}', ${dni_paciente}, ${peso_paciente}, ${altura_paciente}, ${edad_paciente}, '${nacimiento_paciente}', ${talle_paciente}, '${contacto_paciente}', '${email_paciente}', '${comentario_paciente}', '-', '-', '-', '-', '-', '-', '-', '-')`;
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