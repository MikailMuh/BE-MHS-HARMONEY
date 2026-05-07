/**
 * Bcrypt Helpers untuk password hashing.
 *
 * Flow:
 *   - Sign Up: user kasih plain password → hashPassword() → simpan hash di DB
 *   - Sign In: user kasih plain password → comparePassword(plain, hashFromDB) → boolean
 *
 * Bcrypt itu one-way hashing dengan salt — gak bisa di-reverse.
 * Salt rounds = berapa kali hashing diulang. Lebih tinggi = lebih aman tapi lebih lambat.
 * 10 = balance optimal (gua set di .env).
 */

const bcrypt = require('bcryptjs');
const config = require('../config/env');

/**
 * Hash plain password.
 * @param {string} plain
 * @returns {Promise<string>} - hashed password
 */
async function hashPassword(plain) {
  return bcrypt.hash(plain, config.bcrypt.saltRounds);
}

/**
 * Compare plain password dengan hash di DB.
 * @param {string} plain - password yang user input
 * @param {string} hashed - hash dari DB
 * @returns {Promise<boolean>} - true kalo match
 */
async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, comparePassword };