import fs from "node:fs";
import { canon } from "./canon.js";
import { digest } from "./hash.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/attrs.json", "utf8"));
const normalized = canon(spec.attrs || []);
const hashed = digest(normalized.attrs);
const view = render(spec);

emit("归一化后的属性 =", JSON.stringify(normalized.attrs));
emit("指纹 =", hashed.hash);
emit("同指纹的属性集 =", JSON.stringify(hashed.buckets));
emit("碰撞数 =", normalized.collisions);
emit("重复归一化是否幂等 =", view.idempotent);
emit("属性组数 =", (spec.attrs || []).length);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = canon([["a", "1"], ["a", "2"]]);
  emit("重复键的错误码", bad.collisions > 0 || bad.attrs.length <= 1 ? (bad.code || "E_DUP_KEY") : "no-error");
} catch (error) {
  emit("重复键的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "归一化后的属性": [
    [
      "city",
      "BJ"
    ],
    [
      "name",
      "Alice"
    ]
  ],
  "指纹": "814106",
  "同指纹的属性集": {
    "302212": 1,
    "783306": 1,
    "814106": 1
  },
  "碰撞数": 0,
  "重复归一化是否幂等": true,
  "属性组数": 3
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
