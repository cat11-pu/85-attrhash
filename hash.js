// hash.js：指纹（归一化属性拼成 "k=v&k=v" 字符串，取多项式摘要 mod 1000003）
import { isGroupList, mergeGroups, normalizeGroup } from "./canon.js";

const MOD = 1000003;
const BASE = 131;

export function hashString(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * BASE + text.charCodeAt(i)) % MOD;
  return String(h);
}

export function canonicalString(pairs) {
  return pairs.map(([key, value]) => `${key}=${value}`).join("&");
}

export function digest(attrs) {
  const input = Array.isArray(attrs) ? attrs : [];
  let groups;
  let merged;
  if (Array.isArray(attrs) && Array.isArray(attrs.groups)) {
    groups = attrs.groups;
    merged = input;
  } else if (isGroupList(input)) {
    groups = input.map(normalizeGroup);
    merged = mergeGroups(groups);
  } else {
    groups = [normalizeGroup(input)];
    merged = groups[0];
  }
  // 指纹相同的组并入同一个桶（一次线性扫描，不两两比较）
  const buckets = {};
  for (const group of groups) {
    const h = hashString(canonicalString(group));
    buckets[h] = (buckets[h] || 0) + 1;
  }
  return { hash: hashString(canonicalString(merged)), buckets };
}
