const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { memoryStore } = require('../store/memoryStore');

function createToken(user) {
  return jwt.sign(
    { id: user.id || user._id?.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

async function signup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Mongo mode
  if (mongoose.connection.readyState === 1) {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user);
    return res.status(201).json({ user: { id: user._id, name, email }, token });
  }

  // Memory mode
  const exists = memoryStore.users.find((u) => u.email === email);
  if (exists) return res.status(409).json({ message: 'Email already registered.' });

  const user = { id: `u_${Date.now()}`, name, email, passwordHash };
  memoryStore.users.push(user);
  const token = createToken(user);
  return res.status(201).json({ user: { id: user.id, name, email }, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = createToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  }

  const user = memoryStore.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

  const token = createToken(user);
  return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
}

module.exports = { signup, login };
