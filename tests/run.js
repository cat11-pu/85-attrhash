import assert from "node:assert";
import { canon } from "../canon.js";
import { digest } from "../hash.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const attrs = [["A", "2"], ["b", "1"]];

check("canon returns attrs", () => {
  assert.ok(Array.isArray(canon(attrs).attrs));
});

check("canon reports collisions", () => {
  assert.strictEqual(typeof canon(attrs).collisions, "number");
});

check("digest returns hash", () => {
  assert.strictEqual(typeof digest(attrs).hash, "string");
});

check("digest returns buckets", () => {
  assert.strictEqual(typeof digest(attrs).buckets, "object");
});

check("render exposes idempotent flag", () => {
  assert.strictEqual(typeof render({ attrs: attrs }).idempotent, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
