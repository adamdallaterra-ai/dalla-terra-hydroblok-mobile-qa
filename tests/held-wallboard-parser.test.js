'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {serverProductId,visiblePurchaseControls,HELD} = require('./held-wallboard-public-readonly');
test('server variant extraction is independent of class/attribute ordering',()=>{
  assert.equal(serverProductId('<input class="o_not_editable product_id" name="product_id" type="hidden" value="10972">'),10972);
  assert.equal(serverProductId('<input value="10972" name="product_id" class="product_id">'),10972);
  assert.equal(serverProductId('<input type="hidden" value="10238" name="product_id">'),10238);
});
test('missing, malformed and unrelated inputs never count as verified',()=>{
  assert.equal(serverProductId('<input name="x" value="10972">'),null);
  assert.equal(serverProductId('<input name="product_id" value="hello">'),null);
  assert.equal(serverProductId(''),null);
});
test('guest add-to-cart labels are explicitly flagged',()=>{
  assert.deepEqual(visiblePurchaseControls(['Home','Add to Order','Dealer sign in','Add to Cart']),['Add to Order','Add to Cart']);
  assert.deepEqual(visiblePurchaseControls(['Dealer sign in','Contact Us']),[]);
});
test('correct public URL uses underlying attribute value IDs',()=>{
  assert.ok(HELD.endsWith('attribute_values=346%2C305'));
  assert.ok(!HELD.includes('1027%2C906'));
});
