require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { User, Task } = require("./models");
const authentication = require("./middleware/authentication");
const sendEmail = require("./middleware/email");

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
    message: "Log in successful",
    user: { email: user.email, token: access_token },
  });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res.status(404).json({ message: "This account does not exist" });
  }

  const token = `${Math.floor(100000 + Math.random() * 900000)}`;

  user.resetToken = token;
  await user.save();

  await sendEmail(
    user.email,
    "Reset Password Token",
    `Use the following token ${token} to reset your password.`
  );

  res.status(200).json({
    message: "Email sent successful",
  });
});

app.get("/todos", authentication, async (req, res) => {
  const { userId } = req.query;
  const tasks = await Task.findAll({ where: { userId } });

  res.status(200).json({
    message: "Task fetched successfully",
    tasks,
  });
});

app.post("/todos", authentication, async (req, res) => {
  const { name, done, userId } = req.body;
  const task = await Task.create({
    name,
    done,
    userId,
  });

  res.status(200).json({
    message: "Task created successfully",
    task,
  });
});

app.put("/todos/:id", authentication, async (req, res) => {
  const { id } = req.params;
  const { name, done } = req.body;

  const task = await Task.findOne({ where: { id } });

  task.name = name;
  task.done = done;

  await task.save();

  res.status(200).json({
    message: "Task updated successfully",
    task,
  });
});

app.delete("/todos/:id", authentication, async (req, res) => {
  const { id } = req.params;

  const task = await Task.findOne({ where: { id } });

  await task.destroy();

  res.status(200).json({
    message: "Task deleted successfully",
  });
});

app.listen(port, () => {
  console.log(`The app is running on port ${port}`);
});
