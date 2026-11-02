'use strict';
/**
 * DT8_HB_BACKEND_GUARD_POLICY_DESIGN_V1_20261102
 * Pure OFFLINE policy model. No Odoo connection, network, orders, email, or side effects.
 * A PASS proves only the expected decision matrix, NOT installed Studio rules.
 * Proposed company-8-only order-line create/product-change and draft confirmation.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const HELD = 10972;
const DT = 8;
function rejectOnLineInput({companyId, productId, event, productChanged=false}) {
  const checkEvent = event === 'create' || (event === 'edit' && productChanged);
  return checkEvent && companyId === DT && productId === HELD;
}
function rejectOnConfirmation({companyId, oldState, newState, productIds=[]}) {
  return companyId === DT && oldState !== 'sale' && oldState !== 'done'
    && ['sale','done'].includes(newState) && productIds.includes(HELD);
}
test('new company-8 held line is denied irrespective of source channel/website', () => {
  for (const source of ['dealer','public website cart','back office','RPC','API','import']) {
    assert.equal(rejectOnLineInput({companyId:8,productId:10972,event:'create',source}),true,source);
  }
});
test('company-8 product-changing edit to held line denied', () => {
  assert.equal(rejectOnLineInput({companyId:8,productId:10972,event:'edit',productChanged:true}),true);
});
test('unrelated historic-line edits are not retroactively blocked by this policy model', () => {
  assert.equal(rejectOnLineInput({companyId:8,productId:10972,event:'edit',productChanged:false}),false);
  assert.equal(rejectOnLineInput({companyId:8,productId:10972,event:'read'}),false);
});
test('company 2 and unrelated products remain permitted', () => {
  for (const companyId of [2,1,9]) {
    assert.equal(rejectOnLineInput({companyId,productId:10972,event:'create'}),false);
    assert.equal(rejectOnConfirmation({companyId,oldState:'draft',newState:'sale',productIds:[10972]}),false);
  }
  for (const productId of [10238,10274,10294]) {
    assert.equal(rejectOnLineInput({companyId:8,productId,event:'create'}),false);
    assert.equal(rejectOnConfirmation({companyId:8,oldState:'draft',newState:'sale',productIds:[productId]}),false);
  }
});
test('company-8 draft confirmation with held line fails closed', () => {
  assert.equal(rejectOnConfirmation({companyId:8,oldState:'draft',newState:'sale',productIds:[10238,10972]}),true);
  assert.equal(rejectOnConfirmation({companyId:8,oldState:'sent',newState:'sale',productIds:[10972]}),true);
  assert.equal(rejectOnConfirmation({companyId:8,oldState:'sale',newState:'sale',productIds:[10972]}),false);
  assert.equal(rejectOnConfirmation({companyId:8,oldState:'sale',newState:'done',productIds:[10972]}),false);
});
test('no false positives for ordinary draft edit or cancellation', () => {
  for (const newState of ['draft','sent','cancel']) {
    assert.equal(rejectOnConfirmation({companyId:8,oldState:'draft',newState,productIds:[10972]}),false);
  }
});
