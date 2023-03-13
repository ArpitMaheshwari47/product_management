const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/userRoute")
const mongoose = require("mongoose");
const dotenv = require("dotenv")

const app = express();
dotenv.config()

app.use(bodyParser.json());


mongoose.connect("mongodb+srv://arpit:Ak8290063171@cluster0.b0cqj.mongodb.net/Arpit-db"
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 5000, function () {
  console.log("Express app running on port " + (process.env.PORT || 5000));
});

