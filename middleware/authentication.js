require("dotenv").config();
const jwt = require("jsonwebtoken");

async function authentication(req, res, next) {
  try {
    if (!req.headers.authorization) throw { name: "Invalid token" };
    let [type, token] = req.headers.authorization.split(" ");
    if (type !== "Bearer") throw { name: "Invalid token" };
    let payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) throw { name: "Invalid token" };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authentication;
