const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

const User = require("../models/User");

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  "/",
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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("Passed: " + JSON.stringify(req.body));
  }
);

module.exports = router;
