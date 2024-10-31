require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { User } = require("./models");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res, next) => {
  try {
    let { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      email,
      password: hashedPassword,
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });

  const samePassword = await bcrypt.compare(password, user.password);

  if (!user || !samePassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  let access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.status(200).json({
    message: "Signin successful",
    user: { email: user.email, token: access_token },
  });
});

app.listen(port, () => {
  console.log(`The app is running on port ${port}`);
});
