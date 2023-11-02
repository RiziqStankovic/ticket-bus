const mongoose = require("mongoose");

mongoose.connect(process.env.mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Mongo Db Connection Successful");
});

db.on("error", (err) => {
  console.error("Mongo Db Connection Failed:", err);
});
// const mongoose = require("mongoose");

// mongoose.connect(process.env.mongo_url);

// const db = mongoose.connection;

// db.on("connected", () => {
//   console.log("Mongo Db Connection Successful");
// });

// db.on("error", () => {
//   console.log("Mongo Db Connection Failed");
// });
