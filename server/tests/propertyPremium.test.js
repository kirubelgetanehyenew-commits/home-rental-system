const test = require('node:test');
const assert = require('node:assert/strict');

const Property = require('../models/Property');
const Payment = require('../models/Payment');
const { validatePremiumPropertyRequest, PREMIUM_PROPERTY_FEE } = require('../controllers/propertyController');
const { grantPremiumProperty } = require('../controllers/adminController');

test('landlord premium request without payment is rejected', () => {
  const result = validatePremiumPropertyRequest({
    role: 'landlord',
    premiumRequested: true,
    premiumFeePaid: false,
  });

  assert.equal(result.valid, false);
  assert.match(result.message, /premium/i);
  assert.equal(result.fee, PREMIUM_PROPERTY_FEE);
});

test('admin-approved premium listing passes validation', () => {
  const result = validatePremiumPropertyRequest({
    role: 'landlord',
    premiumRequested: true,
    premiumFeePaid: true,
  });

  assert.equal(result.valid, true);
  assert.equal(result.fee, PREMIUM_PROPERTY_FEE);
});

test('admin cannot grant premium without payment confirmation', async () => {
  const originalFindById = Property.findById;

  try {
    Property.findById = async () => ({
      premiumRequested: true,
      premiumFeePaid: false,
      isPremium: false,
      status: 'pending',
      save: async () => {},
    });

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return this;
      },
    };

    await grantPremiumProperty(
      { params: { id: 'property-1' }, user: { _id: 'admin-1' } },
      res
    );

    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /fixed fee|payment/i);
  } finally {
    Property.findById = originalFindById;
  }
});

test('admin approval marks the premium payment as received', async () => {
  const originalFindById = Property.findById;
  const originalFindOne = Payment.findOne;
  let paymentWasLookedUp = false;

  try {
    Property.findById = async () => ({
      _id: 'property-1',
      premiumRequested: true,
      premiumFeePaid: true,
      isPremium: false,
      status: 'pending',
      save: async function () {
        this.isPremium = true;
        this.premiumApprovedAt = new Date();
        return this;
      },
    });

    Payment.findOne = async () => {
      paymentWasLookedUp = true;
      return {
        status: 'pending',
        save: async function () {
          this.status = 'approved';
          return this;
        },
      };
    };

    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return this;
      },
    };

    await grantPremiumProperty(
      { params: { id: 'property-1' }, user: { _id: 'admin-1' } },
      res
    );

    assert.equal(paymentWasLookedUp, true);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.match(res.payload.message, /premium|received/i);
  } finally {
    Property.findById = originalFindById;
    Payment.findOne = originalFindOne;
  }
});
