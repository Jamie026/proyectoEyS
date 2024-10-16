const express = require("express");
const app = express();
const ms = require("ms");
const path = require("path");
const handlebars = require("express-handlebars");
const session = require("express-session");
const cookieParser = require("cookie-parser")
require('dotenv').config();

const port = 3000;

app.set("view engine", "hbs");

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false, 
    saveUninitialized: true, 
    cookie: { 
        secure: false,
        maxAge:  ms(process.env.SESSION_EXPIRATION)
    } 
}));

app.engine("hbs", handlebars.engine({
    defaultLayout: "index",
    layoutsDir: __dirname + "/views/layouts", 
    extname: "hbs",
    partialsDir: __dirname + "/views/partials/",
    helpers: require("./config/handlebars-helpers")
}));

app.use(express.static(path.join(__dirname, "public")));

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

const router = require("./routes/index.js");
const dashboard = require("./routes/dashboard.js");
const storage = require("./routes/storage.js");

app.use("/", router);
app.use("/dashboard", dashboard);
app.use("/storage", storage);

app.listen(port, () => console.log(`App listening to port ${port}`));