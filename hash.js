// hash.js：指纹
// 把归一化后的属性拼成 "k=v&k=v" 字符串，取多项式摘要（base 131，mod 1000003）。
// 指纹相同的组并入同一个桶；撞了（不同组同指纹）桶里计数会大于 1，能看出来。

const BASE = 131;
const MOD = 1000003;

export function fingerprint(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * BASE + text.charCodeAt(i)) % MOD;
  }
  return h;
}

export function canonical(pairs) {
  return pairs.map(([key, value]) => key + "=" + value).join("&");
}

export function digest(attrs) {
  const hash = String(fingerprint(canonical(attrs)));
  const groups = Array.isArray(attrs.groups) ? attrs.groups : [attrs];
  const buckets = {};
  for (const group of groups) {
    const fp = fingerprint(canonical(group));
    buckets[fp] = (buckets[fp] || 0) + 1;
  }
  return { hash, buckets };
}
