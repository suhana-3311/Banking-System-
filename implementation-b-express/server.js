require("dotenv").config();

const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");

const routes = require("./routes");
const hbsHelpers = require("./helpers/hbsHelpers");
const { notFound, internalError } = require("./controllers/mainController");

const app = express();
const PORT = process.env.PORT || 3001;

app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "views", "layouts"),
  partialsDir: path.join(__dirname, "views", "partials"),
  helpers: hbsHelpers
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

routes(app);

app.use(notFound);
app.use(internalError);

app.listen(PORT, () => {
  console.log(`Implementation B (Express + Handlebars) running on http://localhost:${PORT}`);
});