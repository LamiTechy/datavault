const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/admin/login ─────────────────────────────────────────────────────
router.post('/login', [
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const { username, password } = req.body;
  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_PASSWORD;
  if (!validUsername || !validPassword) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, expiresIn: '8h' });
});

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', stateOfOrigin = '', stateOfResidence = '', sortBy = 'submittedAt', order = 'desc' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName:  { $regex: search, $options: 'i' } },
        { lastName:   { $regex: search, $options: 'i' } },
        { email:      { $regex: search, $options: 'i' } },
        { phone:      { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
      ];
    }
    if (status)           query.status           = status;
    if (stateOfOrigin)    query.stateOfOrigin    = { $regex: stateOfOrigin,    $options: 'i' };
    if (stateOfResidence) query.stateOfResidence = { $regex: stateOfResidence, $options: 'i' };
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ [sortBy]: order === 'asc' ? 1 : -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();
    res.json({ users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ─── PATCH /api/admin/users/:id/status ────────────────────────────────────────
router.patch('/users/:id/status', authMiddleware, [body('status').isIn(['new_member', 'old_member', 'admin'])], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid status value.' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'Status updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [total, statusCounts, recentToday, topOriginStates, topResidenceStates] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({ submittedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      User.aggregate([{ $group: { _id: '$stateOfOrigin', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      User.aggregate([{ $group: { _id: '$stateOfResidence', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    ]);
    const byStatus = {};
    statusCounts.forEach(s => { byStatus[s._id] = s.count; });
    res.json({ total, byStatus, today: recentToday, topOriginStates, topResidenceStates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/admin/states ─────────────────────────────────────────────────────
router.get('/states', authMiddleware, async (req, res) => {
  try {
    const [origin, residence] = await Promise.all([User.distinct('stateOfOrigin'), User.distinct('stateOfResidence')]);
    res.json({ origin: origin.filter(Boolean).sort(), residence: residence.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch states.' });
  }
});

module.exports = router;
