"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
// routes import
var projectRoutes_js_1 = require("./routes/projectRoutes.js");
// Route import 
//Configuration 
dotenv_1.default.config();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
// Home route 
app.get('/', function (req, res) {
    res.send("SERVER IS RUNNING ");
});
// Routes
app.use("/", projectRoutes_js_1.default);
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("APP IS LISTNING AT ".concat(port));
});
