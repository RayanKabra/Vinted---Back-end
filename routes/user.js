const express = require("express");

const router = express.Router();

const User = require("../models/User");

//import de mes packages pour mdp de token
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;

    if (username) {
      const user = await User.findOne({ email: email });

      if (user === null) {
        const salt = uid2(64);
        const token = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);

        console.log(hash);

        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          token: token,
          salt: salt,
          hash: hash,
        });

        await newUser.save();
        res.json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(409).json({ error: "Email already used" });
      }
    } else {
      res.status(400).json({ error: "Username is missing" });
    }

    // if (!req.body.username) {
    //   return res.status(400).json({ message: "username missing" });
    // }

    // if (user) {
    //   return res.status(400).json({ message: "user already in db" });
    // }

    // console.log(newUser);

    // return res.status(201).json({
    //   _id: newUser._id,
    //   token: newUser.token,
    //   account: newUser.account,
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    // console.log(req.body);

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const newHash = SHA256(req.body.password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
    // res.json("OK");
    // if (!user) {
    //   return res.status(400).json({ message: "email or password incorrect" });
    // }

    // const passwordHashed = SHA256(req.body.password + user.salt).toString(
    //   encBase64
    // );

    // if (passwordHashed === user.hash) {
    //   return res.status(200).json({
    //     _id: user._id,
    //     token: user.token,
    //     account: user.account,
    //   });
    // } else {
    //   return res.status(400).json({ message: "email or password incorrect" });
    // }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
