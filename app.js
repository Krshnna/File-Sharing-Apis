const express = require("express");
const { connectDatabase } = require("./config/db");
const app = express();
const path = require("path");
const cors = require("cors")

require("dotenv").config({ path: "config/config.env" });
connectDatabase();

const corsOptions = {
  origin: "http://127.0.0.1:5500",
};

app.use(cors(corsOptions));

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const files = require("./routes/files");

//importing routes here
app.use("/api/v1", files);

module.exports = app;
