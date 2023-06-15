import express from "express";
import { producto } from "../DAO/ProductManager.js";
import { ProductService } from "../services/product.services.js";
import { ProductModel } from "../DAO/models/product.model.js";

export const SocketRouter = express.Router();

const Service = new ProductService();

// SocketRouter.get("/", async (req, res) => {
//     let productos = await Service.getAll();
//     productos = JSON.parse(JSON.stringify(productos));
//     return res.render("realTimeProducts", { productos });
//     // return res.status(200).json({ status: "success", msg: `Se agrego el producto:${productos} al carrito`, data: productos });
// });

SocketRouter.get("/", async (req, res) => {
    const { page, limit, sort, query, querySerch } = req.query;
    // console.log("req.query", req.query);
    // console.log(page);
    let busqueda = {};
    querySerch && query ? (busqueda = { [query]: [querySerch] }) : null;
    console.log("busqueda", busqueda);
    const queryRes = await ProductModel.paginate(busqueda, { limit: limit || 10, page: page || 1, sort: { [query]: sort || 1 } });
    // console.log("queryRes", queryRes);
    let products = JSON.parse(JSON.stringify(queryRes.docs));
    // console.log("products", products);
    const { docs, ...rest } = queryRes;
    let links = [];
    for (let i = 1; i < rest.totalPages + 1; i++) {
        links.push({ label: i, href: "http://localhost:8080/realtimeproducts?page=" + i });
    }
    // console.log("links", links);
    // console.log("rest", rest);
    // return res.status(200).render("home", { productos: products, pagination: rest, links });
    return res.render("realTimeProducts", { productos: products, pagination: rest, links });
    // return res.status(200).json({ status: "success", msg: `Se agrego el producto:${productos} al carrito`, data: productos });
});
