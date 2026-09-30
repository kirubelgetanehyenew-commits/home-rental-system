const test = require('node:test');
const assert = require('node:assert/strict');

const { isTenancyExpired, buildExpiryMessage } = require('../utils/tenancyExpiry');

test('expired approved tenancy is detected', () => {
  const booking = {
    status: 'approved',
    leaseEndDate: new Date(Date.now() - 1000 * 60).toISOString(),
  };

  assert.equal(isTenancyExpired(booking), true);
});

test('future approved tenancy is not expired', () => {
  const booking = {
    status: 'approved',
    leaseEndDate: new Date(Date.now() + 1000 * 60).toISOString(),
  };

  assert.equal(isTenancyExpired(booking), false);
});

test('expiry message includes property and contact details', () => {
  const message = buildExpiryMessage({
    fullName: 'Alice',
    propertyTitle: 'Sunrise Flat',
    endDate: new Date('2026-09-30T00:00:00Z'),
  });

  assert.match(message, /Alice/);
  assert.match(message, /Sunrise Flat/);
  assert.match(message, /2026/);
});
