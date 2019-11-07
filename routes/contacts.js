const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

const User = require("../models/User");
const Contact = require("../models/Contact");

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/contacts
// @desc    Add new contact
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required")
        .not()
        .isEmpty(),
      check("email", "Please provide a valid Email").isEmail()
    ]
  ],
  async (req, res) => {
    // check if validation passed
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // extract sent values
    const { name, email, phone, type } = req.body;

    // create and save new contact
    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });

      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/contacts
// @desc    Update contact
// @access  Private
router.put("/:id", auth, async (req, res) => {
  // extract sent values
  const { name, email, phone, type } = req.body;

  // build contact onject
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  // find and update the user
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized!" });
    }

    // update the contact
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/contacts
// @desc    Delete contact
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  // find and delete the user
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized!" });
    }

    // delete the contact
    await Contact.findByIdAndRemove(req.params.id);
    res.json({ msg: "Contact removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
