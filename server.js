/**
 * @author Martin Alemajoh
 * @description This is the main entry point for the service.
 * @date 7/19/2021
 */

require("dotenv").config();

const http = require("http");
const path = require("path");
const app = require(path.join(__dirname, "app"));



//configurations for http server
const protocol = "http";
const option = {};
const httpServer = http.createServer(option, app);



const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

//initializing and starting server.
httpServer.listen(PORT, HOST, () => {
    console.log(`Signup Server Started: ${protocol}://${HOST}:${PORT}`);
});