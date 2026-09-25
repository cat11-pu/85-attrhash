// canon.js：归一化
// 每组属性：键名小写折叠（值不变）、按键名升序排列；
// 同组内键名重复记一次碰撞并标记 E_DUP_KEY（保留先出现的值）。
// 各组规范形式合并成一份规范属性集（同键先出现的值优先）作为 attrs 返回；
// 每组的规范形式挂在 attrs.groups（不可枚举）上，供 digest 逐组分桶。

function isGroupList(attrs) {
  return attrs.length > 0 && Array.isArray(attrs[0]) && Array.isArray(attrs[0][0]);
}

function normalizeGroup(group) {
  const seen = new Map();
  let dups = 0;
  for (const pair of group) {
    const key = String(pair[0]).toLowerCase();
    if (seen.has(key)) { dups += 1; continue; }
    seen.set(key, pair[1]);
  }
  const pairs = [...seen.entries()];
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return { pairs, dups };
}

export function canon(attrs) {
  const groups = isGroupList(attrs) ? attrs : [attrs];
  let collisions = 0;
  const normalizedGroups = groups.map((group) => {
    const { pairs, dups } = normalizeGroup(group);
    collisions += dups;
    return pairs;
  });
  const merged = new Map();
  for (const pairs of normalizedGroups) {
    for (const [key, value] of pairs) {
      if (!merged.has(key)) merged.set(key, value);
    }
  }
  const normalized = [...merged.entries()];
  normalized.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  Object.defineProperty(normalized, "groups", { value: normalizedGroups, enumerable: false });
  const result = { attrs: normalized, collisions };
  if (collisions > 0) result.code = "E_DUP_KEY";
  return result;
}
