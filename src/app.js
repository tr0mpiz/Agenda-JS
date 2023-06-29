import express from "express";

// import { SocketRouter } from "./routers/socket.liveRouter.js";
import session from "express-session";
import { agendaHtmlRouter } from "./routers/agendaHtmlRouter.js";
import { pacienteHtmlRouter } from "./routers/pacienteHtmlRouter.js";
import { loginHtmlRouter } from "./routers/loginHtmlRouter.js";
import handlebars from "express-handlebars";
import path from "path";
import { con, __dirname,uploader, user } from "./utils.js";
import { Server } from "socket.io";





//import webSocket from "./routers/webSocket.js";

// import { producto } from "./../DAO/ProductManager.js";

const app = express();
const port = 8081;
const usuario=con.user;

const httpServer = app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});



//const socketServer = new Server(httpServer);
//webSocket(socketServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: 'secreto', // Cambia esto por una cadena secreta más segura
  resave: false,
  saveUninitialized: true
}));
//Rutas: API REST CON JSON
// app.use("/api/products", productRouter);
// app.use("/api/carts", cartRouter);

//Rutas: HTML RENDER SERVER SIDE
app.use("/agenda", agendaHtmlRouter);
app.use("/paciente", pacienteHtmlRouter);
app.use("/login", loginHtmlRouter);


//Rutas: SOCKETS
//app.use("/realtimeproducts", SocketRouter);


app.get("/*", async (req, res) => {
    return res.status(404).json({ status: "error", msg: "no encontrado", data: {} });
});