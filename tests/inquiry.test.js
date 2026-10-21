import test from 'node:test';
import assert from 'node:assert/strict';
import { makeInquiry } from '../src/inquiry.js';

test('creates an inquiry with trimmed contact details and multiline requirements', () => {
  const result = makeInquiry({ name: ' Alex ', email: 'alex@example.com', company: 'Example Ltd', message: '100 units\nBlue packaging' });
  assert.match(result, /Name: Alex\n/);
  assert.match(result, /Email: alex@example.com/);
  assert.match(result, /Company: Example Ltd/);
  assert.match(result, /100 units\nBlue packaging/);
});
test('rejects incomplete inquiries', () => {
  assert.throws(() => makeInquiry({ name: 'Alex' }), /complete all fields/);
});
test('rejects invalid email addresses', () => {
  assert.throws(() => makeInquiry({ name: 'Alex', email: 'invalid', company: 'Example', message: '100 units' }), /valid email/);
});
