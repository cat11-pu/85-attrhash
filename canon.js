// canon.js：归一化（基线：原样返回、不排序）
export function canon(attrs) {
  return { attrs: attrs.slice(), collisions: 0 };
}
