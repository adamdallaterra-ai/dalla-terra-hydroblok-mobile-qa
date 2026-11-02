'use strict';

/**
 * DT8_HB_NO_EMAIL_VENDOR_CODE_REPLAY_V1_20261101
 *
 * Pure, offline replay of the five CBS supplier lines on Dalla Terra PS31009.
 * Fixture IDs/codes were checked against company-8 Odoo supplierinfo on Nov 1.
 *
 * This intentionally has NO network, Odoo, email, draft, order or filesystem code.
 * It checks decision logic and historical failure modes; it does NOT execute an
 * Odoo QWeb render, prove live mail.template 19 repaired, or complete a real pilot.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const CBS = 964; // Dalla Terra CBS partner (company 8)
const seller = (id, variant, code, partner = CBS) => ({ id, variant, code, partner });
const families = Object.freeze({
  6608: [
    seller(76167, 10274, 'HBJSCART'),
    seller(76168, 10277, 'HBJSSAUS')
  ],
  6609: [
    seller(76152, 10285, 'HBCARTGUN'),
    seller(76203, 10284, 'HBSAUSGUN')
  ],
  6605: [seller(76209, 10184, 'HBSCM60')],
  6610: [seller(76212, 10294, 'HBSCREWWASH100')]
});
const lines = Object.freeze([
  { poLine: 6673, variant: 10274, family: 6608, expected: 'HBJSCART' },
  { poLine: 6674, variant: 10277, family: 6608, expected: 'HBJSSAUS' },
  { poLine: 6675, variant: 10284, family: 6609, expected: 'HBSAUSGUN' },
  { poLine: 6676, variant: 10184, family: 6605, expected: 'HBSCM60' },
  { poLine: 6677, variant: 10294, family: 6610, expected: 'HBSCREWWASH100' }
]);

// Mirrors the unsafe first-seller choice still found in raw mail.template 19.
function legacyFirstSeller(list, partner = CBS) {
  return list.find(s => s.partner === partner)?.code || null;
}

// An independently modelled, fail-closed candidate rule for the raw template.
// In live Odoo, action 1559 has its own exact-variant composer/readback guards.
function resolveVendorSku(line, list, partner = CBS) {
  const usable = list.filter(s => s.partner === partner && typeof s.code === 'string' && s.code.trim());
  const exact = usable.filter(s => s.variant === line.variant);
  const generic = usable.filter(s => s.variant == null);
  const candidates = exact.length ? exact : generic;
  const uniqueCodes = [...new Set(candidates.map(s => s.code.trim()))];
  return uniqueCodes.length === 1 ? uniqueCodes[0] : null;
}

test('Historical 2026-09-23 raw first-seller failure is reproducible', () => {
  const sausage = lines[1], gun = lines[2];
  assert.equal(legacyFirstSeller(families[sausage.family]), 'HBJSCART');
  assert.notEqual(legacyFirstSeller(families[sausage.family]), sausage.expected);
  assert.equal(legacyFirstSeller(families[gun.family]), 'HBCARTGUN');
  assert.notEqual(legacyFirstSeller(families[gun.family]), gun.expected);
});

for (const line of lines) {
  test('CBS line ' + line.poLine + ' matches exact variant ' + line.variant, () => {
    assert.equal(resolveVendorSku(line, families[line.family]), line.expected);
  });
}

test('Supplier row ordering cannot change any of the five codes', () => {
  for (const line of lines) {
    assert.equal(resolveVendorSku(line, [...families[line.family]].reverse()), line.expected);
  }
});

test('Codes belonging to another supplier are ignored', () => {
  const line = lines[1];
  const unrelated = seller(99999, line.variant, 'INCORRECT_OTHER_VENDOR', 999);
  assert.equal(resolveVendorSku(line, [unrelated, ...families[line.family]]), 'HBJSSAUS');
});

test('No matching CBS variant or generic row means no code, not a sibling code', () => {
  assert.equal(resolveVendorSku(lines[1], [families[6608][0]]), null);
});

test('Same-vendor template-level code is a last-resort fallback only', () => {
  const line = lines[1], generic = seller(99998, null, 'CONFIRMED_GENERIC_CBS');
  assert.equal(resolveVendorSku(line, [families[6608][0], generic]), generic.code);
  assert.equal(resolveVendorSku(line, [families[6608][0], generic, families[6608][1]]), 'HBJSSAUS');
});

test('Contradictory exact variant CBS codes fail closed', () => {
  const line = lines[1];
  const conflicting = seller(99997, line.variant, 'CONFLICT');
  assert.equal(resolveVendorSku(line, [...families[6608], conflicting]), null);
});

test('Blank and foreign-supplier codes never become proof of vendor availability', () => {
  assert.equal(resolveVendorSku(lines[1], [seller(99996, lines[1].variant, '  ')]), null);
  assert.equal(resolveVendorSku(lines[1], [seller(99995, lines[1].variant, 'FOREIGN', 999)]), null);
});
