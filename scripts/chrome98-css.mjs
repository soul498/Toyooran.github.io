import { transform } from "lightningcss";

function matchBrace(css, open) {
  let depth = 0;
  let quote = "";
  for (let i = open; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) quote = "";
      continue;
    }
    if ((c === '"' || c === "'") && css[i - 1] !== "\\") {
      quote = c;
      continue;
    }
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error("Unbalanced CSS while unwrapping @layer");
}

/** Chrome 98 drops every @layer block, which removes Tailwind. Flatten layers in source order. */
function unwrapLayers(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const atLayer = css.startsWith("@layer", i) && (i === 0 || /[\s;{}]/.test(css[i - 1]));
    if (!atLayer) {
      out += css[i];
      i += 1;
      continue;
    }
    let j = i + 6;
    while (j < css.length && css[j] !== "{" && css[j] !== ";") j += 1;
    if (css[j] === ";") {
      i = j + 1;
      continue;
    }
    if (css[j] !== "{") {
      out += css[i];
      i += 1;
      continue;
    }
    const end = matchBrace(css, j);
    out += unwrapLayers(css.slice(j + 1, end));
    i = end + 1;
  }
  return out;
}

/** Keep dvh for current browsers; older ones stop at the vh declaration. Selectors stay unchanged. */
function addDvhFallback(css) {
  return css.replace(/((?:min-|max-)?height:)([^;}{]*?)dvh([^;}{]*)/g, (_full, prop, before, after) => {
    return `${prop}${before}vh${after};${prop}${before}dvh${after}`;
  });
}

export function chrome98Css(css) {
  const lowered = transform({
    filename: "app.css",
    code: Buffer.from(css),
    minify: true,
    targets: { chrome: 98 << 16 },
  }).code.toString();
  return addDvhFallback(unwrapLayers(lowered));
}
