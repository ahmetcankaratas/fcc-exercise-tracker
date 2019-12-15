const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongo = require("mongodb");
const cors = require("cors");
const router = express.Router;
const mongoose = require("mongoose");

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("we're connected!");
});

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Not found middleware
/*
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });

});
*/
// Error Handling middleware

/*
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});
*/

//myCode
//Schema  n Model
var userSchema = new mongoose.Schema({
  userid: Number,
  username: String
});

var userModel = mongoose.model("user", userSchema);
//create new user
app.post("/api/exercise/new-user", function(req, res) {
  let theData;
  userModel
    .find()
    .exec()
    .then(data => {
      theData = data;
      var newuser = new userModel({
        userid: data.length + 1,
        username: req.body.username
      });
      theData = theData.filter(obj => obj["username"] === req.body.username);

      if (theData.length === 0) {
        newuser.save().then(() => {
          res
            .json({
              userid: data.length + 1,
              username: req.body.username
            })
            .catch(err => {
              console.log(err);
              res.json({ error: err });
            });
        });
      } else {
        res.json({
          error: `username already in database as id = ${theData[0].userid}`
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({ error: err });
    });
});

//get all user's
app.get("/api/exercise/users", function(req, res) {
  userModel
    .find()
    .select("userid username -_id")
    .exec()
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.json({ error: err });
    });
});

//post exercise
//Schema exercise Model
var exerciseSchema = new mongoose.Schema({
  userId: Number,
  description: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

var exModel = mongoose.model("exModel", exerciseSchema);
//Post Part
/*
app.post("/api/exercise/add", function(req, res) {
  let theExercise;
  userModel
    .find()
    .exec()
    .then(data => {
      theExercise = data;

      var newexercise = new exModel({
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date
      });

      theExercise = theExercise.filter(
        obj => obj["userid"] === req.body.userId
      );

      if (theExercise.length !== 0) {
        newexercise.save().then(() => {
          res
            .json({
              userId: req.body.userId,
              description: req.body.description,
              duration: req.body.duration,
              date: req.body.date
            })
            .catch(err => {
              console.log(err);
              res.json({ error: err });
            });
        });
      } else {
        res.json({
          error: `userid not found in database`
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({ error: err });
    });
});
*/

app.post("/api/exercise/add", function(req, res) {
   if (req.body.date === "") {
        req.body.date = new Date().toISOString().slice(0,10); }

  new exModel({
        userId: req.body.userId,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date
      })
.save().then(() => {
          res
            .json({
              userId: req.body.userId,
              description: req.body.description,
              duration: req.body.duration,
              date: req.body.date
            })
            .catch(err => {
              console.log(err);
              res.json({ error: err });
            });
        });
});

app.get("/api/exercise/log/:userId", function (req, res) {
  let startDate = req.query.from
  let endDate = req.query.to
  exModel
  .find({userId: req.params.userId})
  .where({date: { $gt: startDate, $lt: endDate }})
  .limit(parseInt(req.query.limit))
  .select("-_id -__v")
  .exec()
  .then((docs) => {
    res.json({docs})
  })
  .catch(err => {
      res.json({ error: err });
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
