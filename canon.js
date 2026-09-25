// canon.js：归一化（键名小写折叠、按键名升序、同组重复键报 E_DUP_KEY）
const DUP_KEY_CODE = "E_DUP_KEY";

const byKey = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);

// 输入是"组的列表"（每个元素本身是一组键值对）还是"单组"（元素是键值对）
export function isGroupList(input) {
  return input.length > 0 && input.every(
    (item) => Array.isArray(item) && (item.length === 0 || Array.isArray(item[0]))
  );
}

function dupKeyError(key) {
  return Object.assign(new Error(DUP_KEY_CODE), { code: DUP_KEY_CODE, key });
}

// 单组归一化：键名小写折叠（值不变），按键名升序；同组键名重复抛 E_DUP_KEY
export function normalizeGroup(group) {
  const seen = new Map();
  for (const pair of group) {
    const key = String(pair[0]).toLowerCase();
    if (seen.has(key)) throw dupKeyError(key);
    seen.set(key, pair[1]);
  }
  return [...seen.entries()].sort(byKey).map(([key, value]) => [key, value]);
}

// 多组合并：同一键名先出现的值优先，结果仍按键名升序（一次线性扫描）
export function mergeGroups(groups) {
  const seen = new Map();
  for (const group of groups) {
    for (const [key, value] of group) {
      if (!seen.has(key)) seen.set(key, value);
    }
  }
  return [...seen.entries()].sort(byKey).map(([key, value]) => [key, value]);
}

export function canon(attrs) {
  const input = Array.isArray(attrs) ? attrs : [];
  const groups = (isGroupList(input) ? input : [input]).map(normalizeGroup);
  const merged = mergeGroups(groups);
  // 附带逐组归一化结果，供 digest 分桶；数组的非索引属性不参与 JSON 序列化
  merged.groups = groups;
  return { attrs: merged, collisions: 0 };
}
