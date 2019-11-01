const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const config = require("config");

const User = require("../models/User");

// @route   POST api/users
// @desc    Register a user
// @access  Public

router.post(
  "/",
  // validation requirements
  [
    check("name", "Please provide a Name ")
      .not()
      .isEmpty(),
    check("email", "Please provide a valid Email").isEmail(),
    check(
      "password",
      "Please enter a Password with at least 8 characters"
    ).isLength({ min: 8 })
  ],
  async (req, res) => {
    // check if validation passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      // check if email is taken
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "This email is already taken" });
      }

      user = new User({
        name,
        email,
        password
      });
      // hashing the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      // saving the user to db
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      // create and sent Json Web Token
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
