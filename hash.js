// hash.js：指纹（基线：只算键的个数）
export function digest(attrs) {
  return { hash: String(attrs.length), buckets: {} };
}
