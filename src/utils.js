// import { connect } from "http2";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";


const storage = multer.diskStorage({
  destination: 'public/pictures/',
  filename: (req, file, cb) => {
    const { fecha, dni_paciente, hora } = req.body;
    const fileName = `${dni_paciente}_${fecha}_${hora}.png`;
    cb(null, fileName);
  }
});

function quitarEspacios(string) {
    return string.replace(/\s/g, "");
}

function obtenerExtension(nombreArchivo) {
    var partes = nombreArchivo.split(".");
    if (partes.length === 1 || (partes[0] === "" && partes.length === 2)) {
        return "";
    }
    return "." + partes.pop();
}

function showCustomToast(toastBody, toastHeader) {
  
  // Obtener el elemento toast
  

  toastBodyElement.innerText = toastBody;
  toastHeaderElement.innerText = toastHeader;

  var toast = new bootstrap.Toast(toastElement);
  toast.show();
}
export const cartel = showCustomToast;
export const upload = multer({ storage });
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// --------------------mysql------------------------------


import mysql from "mysql"

export const host = "localhost"
export const user = "root"
export const password = ""
export const database = "pro-run"
export const port = 3306

export const con = mysql.createConnection({
  host: host,
  user: user,
  password: "",
  database : 'pro-run',
  port: port
});

// Establece la conexión

export const conuser = mysql.createConnection({
  host: host,
  user: user,
  password: "",
  database : 'usuarios',
  port: port
});
export const ejecutarConsulta0= (query) => {
  return new Promise((resolve, reject) => {
    conuser.query(query, (err, resultados) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(resultados);
    });
  });
};


export const ejecutarConsulta= (query) => {
  return new Promise((resolve, reject) => {
    con.query(query, (err, resultados) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(resultados);
    });
  });
};



      

///

