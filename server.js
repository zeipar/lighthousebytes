// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession = require('cookie-session');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(cookieSession({
  name: "session",
  secret: "lighthouse",
  maxAge: 24 * 60 * 60 * 1000
}));

// Database helper functions
const { getAllItems } = require("./db/helpers/01_items");
const { getUsernameWithID } = require("./db/helpers/username");

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const orderRoutes = require("./routes/order");
const ordersRoutes = require("./routes/orders");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/order", orderRoutes(db));
app.use("/orders", ordersRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    username: null
  };

  getAllItems(db)
    .then((items) => {
      templateVars.items = items;
      if (req.session.user_id) {
        getUsernameWithID(db, req.session.user_id)
          .then((username) => {
            templateVars.username = username;
            res.render("index", templateVars);
          })
      } else {
        res.render("index", templateVars);
      }
    });
});

app.get("/login/:id", (req, res) => {
  req.session.user_id = req.params.id;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
