const test = require('node:test');
const assert = require('node:assert/strict');

const { canTenantReviewProperty } = require('../controllers/reviewController');

test('approved booking allows review', () => {
  assert.equal(canTenantReviewProperty({ status: 'approved' }), true);
});

test('pending or cancelled booking blocks review', () => {
  assert.equal(canTenantReviewProperty({ status: 'pending' }), false);
  assert.equal(canTenantReviewProperty({ status: 'cancelled' }), false);
});

test('missing booking blocks review', () => {
  assert.equal(canTenantReviewProperty(null), false);
});
