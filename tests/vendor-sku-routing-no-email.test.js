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

// An independently modelled, STRICTER fail-closed candidate rule for the raw template.
// In live Odoo, action 1559 has its own exact-variant composer/readback guards.
function resolveVendorSku(line, list, partner = CBS) {
  if (!line || !Number.isInteger(line.variant) || !Array.isArray(list) || !Number.isInteger(partner)) return null;
  // A missing/blank exact-variant seller code is a HARD STOP; never silently fall back
  // to a template-level or sibling SKU. This is an OFFLINE model, not live QWeb.
  const belonging = list.filter(s => s && s.partner === partner && (s.variant === line.variant || s.variant == null));
  const exact = belonging.filter(s => s.variant === line.variant);
  const generic = belonging.filter(s => s.variant == null);
  const candidates = exact.length ? exact : generic;
  if (!candidates.length) return null;
  const codes = candidates.map(s => typeof s.code === 'string' ? s.code.trim() : '');
  if (codes.some(code => !code)) return null;
  const uniqueCodes = [...new Set(codes)];
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


/* DT8_HB_TEMPLATE19_STRICT_AMBIGUITY_FIXTURE_V2_20261101:
 * Tests the OFFLINE decision model and rejects the older staged first-exact
 * suggestion. These cases do not exercise Odoo QWeb, authorize edits or send mail.
 */
test('Same-code duplicate CBS exact sellers are safe, order independent', () => {
  const c = seller(99991, 10277, ' HBJSSAUS ');
  assert.equal(resolveVendorSku(lines[1], [c, ...families[6608]]), 'HBJSSAUS');
  assert.equal(resolveVendorSku(lines[1], [...families[6608], c]), 'HBJSSAUS');
});

test('Contradictory CBS generic codes fail closed instead of picking first', () => {
  const onlyGeneric = [seller(99992, null, 'GENERIC_A'), seller(99993, null, 'GENERIC_B')];
  assert.equal(resolveVendorSku(lines[1], onlyGeneric), null);
});

test('Blank exact variant seller blocks a generic fallback', () => {
  const blankExact = seller(99994, 10277, ' ');
  const generic = seller(99995, null, 'GENERIC_CBS');
  assert.equal(resolveVendorSku(lines[1], [blankExact, generic]), null);
});

test('Conflicting exact variant seller blocks a generic fallback', () => {
  const conflict = seller(99996, 10277, 'NOT_HBJSSAUS');
  const generic = seller(99997, null, 'GENERIC_CBS');
  assert.equal(resolveVendorSku(lines[1], [...families[6608], conflict, generic]), null);
});

test('Whitespace-normalized exact variant duplicates are one unambiguous code', () => {
  assert.equal(resolveVendorSku(lines[1], [
    seller(99998, 10277, '  HBJSSAUS  '), seller(99999, 10277, 'HBJSSAUS')
  ]), 'HBJSSAUS');
});

test('Wrong vendor and unrelated variant never qualify as a fallback', () => {
  assert.equal(resolveVendorSku(lines[1], [
    seller(99910, 10277, 'WRONG_VENDOR', 111), seller(99911, 10274, 'SIBLING')
  ]), null);
});

test('Historical first-exact candidate would incorrectly accept conflicting codes', () => {
  const list = [...families[6608], seller(99912, 10277, 'DIFFERENT_CODE')];
  const firstExact = list.filter(s => s.partner === CBS && s.variant === lines[1].variant)[0].code;
  assert.equal(firstExact, 'HBJSSAUS'); // historic proposed QWeb shortcut
  assert.equal(resolveVendorSku(lines[1], list), null); // strict candidate must stop
});

test('Malformed or absent line/records are rejected, never guessed', () => {
  assert.equal(resolveVendorSku(null, families[6608]), null);
  assert.equal(resolveVendorSku({ variant: null }, families[6608]), null);
  assert.equal(resolveVendorSku(lines[1], null), null);
  assert.equal(resolveVendorSku(lines[1], [{ partner: CBS, variant: 10277, code: null }]), null);
});
