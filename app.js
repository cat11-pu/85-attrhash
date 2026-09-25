// app.js：渲染结果
import { canon } from "./canon.js";
import { digest } from "./hash.js";

export function render(spec) {
  const normalized = canon(spec.attrs || []);
  const hashed = digest(normalized.attrs);
  const again = canon(normalized.attrs);
  const idempotent = JSON.stringify(again.attrs) === JSON.stringify(normalized.attrs);
  return { canon: normalized.attrs, hash: hashed.hash, buckets: hashed.buckets,
           collisions: normalized.collisions, idempotent };
}
