require('dotenv').config();

const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}`;
var database = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
module.exports = {database};