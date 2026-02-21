const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Validation rules
const userValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').matches(/^[+]?[\d\s\-().]{7,20}$/).withMessage('Valid phone number required'),
  body('dateOfBirth').optional({ checkFalsy: true }).isISO8601().withMessage('Valid date of birth required'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say', '']),
  body('stateOfOrigin').trim().notEmpty().withMessage('State of origin is required').isLength({ max: 100 }),
  body('lgaOfOrigin').optional().trim().isLength({ max: 100 }),
  body('stateOfResidence').trim().notEmpty().withMessage('State of residence is required').isLength({ max: 100 }),
  body('lgaOfResidence').optional().trim().isLength({ max: 100 }),
  body('address.street').optional().trim().isLength({ max: 200 }),
  body('address.city').optional().trim().isLength({ max: 100 }),
  body('address.zip').optional().trim().isLength({ max: 20 }),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('message').optional().trim().isLength({ max: 1000 }).withMessage('Message max 1000 chars'),
];

// POST /api/users — Submit user form
router.post('/', userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      stateOfOrigin, lgaOfOrigin, stateOfResidence, lgaOfResidence,
      address, occupation, message,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An entry with this email already exists.' });
    }

    const user = new User({
      firstName, lastName, email, phone,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      stateOfOrigin, lgaOfOrigin,
      stateOfResidence, lgaOfResidence,
      address, occupation, message,
    });
    await user.save();

    res.status(201).json({
      message: 'Your information has been submitted successfully!',
      id: user._id,
    });
  } catch (err) {
    console.error('User submission error:', err);
    res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
});

module.exports = router;
