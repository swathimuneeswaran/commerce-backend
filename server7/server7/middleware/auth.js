const jwt = require("jsonwebtoken");
const { UserSchema } = require("../model/userSchema");

exports.authentication = function (req, res, next) {
  // get token from header
  const token = req.headers.token;
  // check if no token
  if (!token) {
    // 401 not outhorised
    return res.status(401).send({ message: "No token, access denied" });
  }
  // verify token
  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
      if (err) {
        return res.status(401).send({
          message: "Token is not valid!",
        });
      } else {
        req._id = data._id;
        next();
        return;
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.authorization = function (req, res, next) {
  // get token from header
  const token = req.headers.token;
  // check if no token
  if (!token) {
    // 401 not outhorised
    return res.status(401).send({ message: "No token, access denied" });
  }
  // verify token
  try {
    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
      if (err) {
        return res.status(401).send({
          message: "Token is not valid!",
        });
      } else {
        UserSchema.findOne({ _id: data._id }, (err, user) => {
          if (err || !user || user.role !== "admin") {
            return res.status(401).json({ message: "Unauthorized access" });
          }
          req._id = data._id;
          next();
        });

        return;
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};