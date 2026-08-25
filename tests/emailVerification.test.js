const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { normalizeEmail, validateEmail } = require('../server.js');

test('normalizeEmail trims and lowercases email', () => {
  assert.equal(normalizeEmail(' User@Example.com '), 'user@example.com');
});

test('validateEmail accepts a valid email address', () => {
  assert.equal(validateEmail('user@example.com'), true);
});

test('validateEmail rejects an invalid email address', () => {
  assert.equal(validateEmail('not-an-email'), false);
});

test('registration form does not require OTP fields', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.equal(html.includes('send-otp-btn'), false);
  assert.equal(html.includes('otp-code'), false);
});

test('auth form uses username and password only', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.equal(html.includes('register-email'), false);
  assert.equal(html.includes('login-email'), false);
  assert.equal(html.includes('register-username'), true);
  assert.equal(html.includes('register-password'), true);
});

test('order flow opens a dedicated selection page before WhatsApp', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const orderHtmlExists = fs.existsSync(path.join(__dirname, '..', 'order.html'));
  assert.equal(orderHtmlExists, true);
  assert.equal(html.includes('order.html'), true);
});
