// import { connect } from "http2";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/pictures"));
    },
    filename: (req, file, cb) => {
        // cb(null, quitarEspacios(file.originalname));
        cb(null, uuidv4() + obtenerExtension(file.originalname));
    },
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

export const uploader = multer({ storage });
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// --------------------mysql------------------------------


import mysql from "mysql"

export const host = "localhost"
export const user = "root"

export const con = mysql.createConnection({
  host: host,
  user: user,
  password: "",
  database : 'pro-run'
});

// Establece la conexión


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

