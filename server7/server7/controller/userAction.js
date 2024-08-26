const { UserSchema, TokenSchema } = require("../model/userSchema");
const sendEmail = require("../utils/mail");
const bcrypt = require("bcryptjs");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const registerSchema = joi.object({
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  firstname: joi.string().min(3).max(16).required(),
  lastname: joi.string().min(3).max(16).required(),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{6,16}$/)
    .min(8)
    .required(),
});

exports.createUser = async (req, res) => {
  const email = req.body.email;
  const firstname = req.body.firstname;

  try {
    const { error } = await registerSchema.validateAsync(req.body);

    // Save Tutorial in the database
    const users = await UserSchema.findOne({ email: email });
    if (users) {
      return res.status(400).end("email already exist");
    }

    const hashpassword = await bcrypt.hash(req.body.password, 10);

    const userAccount = new UserSchema({
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: hashpassword,
      addresses: [],
      orders: [],
      wallet: { balance: 0, transactions: [] },
      wishlist: [],
      cart: { products: [], subtotal: 0 },
    });

    await userAccount.save();

    const Token = new TokenSchema({
      userid: userAccount._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    Token.save();

    const link = `${process.env.URL}/users/verify/${firstname}?_id=${userAccount._id}&token=${Token.token}`;

    await sendEmail(email, "click here to verify your mail", link);

    return res
      .status(200)
      .send({ message: "verification link has been sent to your mail id" });
  } catch (error) {
    res.status(500).send(error.details[0].message);
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const token = await TokenSchema.findOne({
      userid: req.query._id,
      token: req.query.token,
    });

    if (!token) return res.status(410).json({ message: "Link has expired" });

    const user = await UserSchema.findById(req.query._id);

    if (!user) return res.status(410).json({ message: "Invalid Link" });

    user.isverified = true;
    await user.save();
    await token.delete();
    // res.render("verify");
    res.status(200).json({ message: "User verified successfully" });
  } catch (error) {
    res.end("An error occured");
    console.log(error);
  }
};

const loginSchema = joi.object({
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    .regex(/^[a-zA-Z0-9]{6,16}$/)
    .min(8)
    .required(),
});

exports.loginUser = async (req, res) => {
  const email = req.body.email;

  try {
    const { error } = await loginSchema.validateAsync(req.body);

    if (error) {
      return res.status(400).send(error);
    }

    const user = await UserSchema.findOne({ email: email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Email ID does not exist. Please register." });
    } else if (!user.isverified) {
      return res.status(403).json({
        message:
          "Your account is not verified. Please visit the link in your email.",
      });
    }

    const validpassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validpassword) {
      return res
        .status(422)
        .json({ message: "Please enter a valid password." });
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);

      return res.json({
        token: token,
        user: user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.requestPassword = async (req, res) => {
  const schema = joi.object({ email: joi.string().email().required() });
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: error.details[0].message });
    }

    const user = await UserSchema.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "email doesn't exist." });
    }

    let token = await TokenSchema.findOne({ userid: user._id });
    if (!token) {
      token = await new TokenSchema({
        userid: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.URL}/users/reset-password/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);

    res
      .status(200)
      .json({ message: "Password reset link sent to your email account." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.enterPassword = async (req, res) => {
  try {
    const user = await UserSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Invalid link. User not found." });
    }

    const token = await TokenSchema.findOne({ token: req.params.token });
    if (!token) {
      return res.status(410).json({ message: "Token has expired." });
    }

    res.render("resetpassword", {
      id: req.params.id,
      token: req.params.token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const passwordSchema = joi.object({
    password: joi.string().required(),
    confirmpassword: joi.string().required().valid(joi.ref("password")),
  });

  try {
    const { error } = passwordSchema.validate(req.body);
    if (error) {
      return res.status(422).json({ message: error.details[0].message });
    }

    const token = await TokenSchema.findOne({
      userid: req.params.id,
      token: req.params.token,
    });

    if (!token) {
      return res
        .status(410)
        .json({ message: "Invalid link or token has expired." });
    }

    const user = await UserSchema.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found. Invalid link." });
    }

    const hashpassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashpassword;
    await user.save();
    await token.delete();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await UserSchema.findOne({ _id: req._id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};
