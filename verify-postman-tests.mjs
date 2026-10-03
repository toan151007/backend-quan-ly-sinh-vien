// Mô phỏng Postman runtime: chạy đúng test script trong collection theo thứ tự của bài
// (06 -> 07 -> 08 liên tiếp, không restart) để xác nhận các pm.test đều PASS.
import fs from "node:fs";
import vm from "node:vm";

const collection = JSON.parse(fs.readFileSync("./postman-collection.json", "utf8"));
const vars = Object.fromEntries(collection.variable.map((v) => [v.key, v.value]));

/** Xây dựng một chuỗi khẳng định hỗ trợ .to/.be/.have/.not + eql/be/an/include/property/empty */
function expect(val) {
  let negate = false;
  const self = {};

  const fail = (msg) => { throw new Error(msg); };
  const check = (ok, msg) => {
    if (negate ? ok : !ok) fail(msg);
    negate = false;
    return self;
  };

  const chain = {
    get to() { return chain; },
    get be() { return chain; },
    get have() { return chain; },
    get that() { return chain; },
    get and() { return chain; },
    get not() { negate = !negate; return chain; },
    get empty() { return check((Array.isArray(val) ? val.length === 0 : String(val).length === 0), "expected value to be empty"); },
    get an() {
      return (type) => check(Array.isArray(val) === (type === "array") && (type === "array" || typeof val === type),
        `expected ${JSON.stringify(val)} to be an ${type}`);
    },
    get a() { return chain.an; },
    get string() { return check(typeof val === "string", `expected ${JSON.stringify(val)} to be a string`); },
    get eql() { return (o) => check(JSON.stringify(val) === JSON.stringify(o), `expected ${JSON.stringify(val)} to eql ${JSON.stringify(o)}`); },
    get equal() { return chain.eql; },
    get equals() { return chain.eql; },
    get include() { return (s) => check(String(val).includes(s), `expected ${JSON.stringify(val)} to include ${JSON.stringify(s)}`); },
    get contain() { return chain.include; },
    get property() { return (k) => check(val != null && k in val, `expected object to have property ${k}`); },
  };

  Object.defineProperty(self, "to", { get: () => chain });
  Object.defineProperty(self, "be", { get: () => chain });
  Object.defineProperty(self, "have", { get: () => chain });
  Object.defineProperty(self, "not", { get: () => { negate = !negate; return chain; } });
  self.eql = chain.eql;
  self.equal = chain.eql;
  self.equals = chain.eql;
  self.include = chain.include;
  self.contain = chain.include;
  self.property = chain.property;
  self.an = chain.an;
  self.a = chain.an;
  Object.defineProperty(self, "empty", {
    get: () => check((Array.isArray(val) ? val.length === 0 : String(val).length === 0), "expected value to be empty"),
  });
  return self;
}

let pass = 0, fail = 0;
const lines = [];

for (const item of collection.item) {
  const url = item.request.url.raw.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k]);
  const opt = { method: item.request.method, headers: {} };
  for (const h of item.request.header || []) opt.headers[h.key] = h.value;
  if (item.request.body?.raw) opt.body = item.request.body.raw;

  const res = await fetch(url, opt);
  const text = await res.text();
  const json = () => JSON.parse(text);

  const results = [];
  const pm = {
    response: {
      to: { have: { status: (code) => { if (res.status !== code) throw new Error(`expected status ${code}, got ${res.status}`); return res; } } },
      json,
      text: () => text,
      code: res.status,
      // pm.response.headers.get("Content-Type") — Postman tra HeaderList, o day dung Headers cua fetch
      headers: {
        get: (name) => res.headers.get(name) ?? null,
        has: (name) => res.headers.has(name),
        toObject: () => Object.fromEntries(res.headers.entries()),
      },
    },
    test: (name, fn) => {
      try { fn(); results.push({ name, ok: true }); }
      catch (e) { results.push({ name, ok: false, err: e.message }); }
    },
    expect,
  };

  const script = item.event?.[0]?.script?.exec;
  if (script) {
    const ctx = vm.createContext({ pm, console, JSON, Array, String });
    vm.runInContext(script.join("\n"), ctx, { timeout: 3000 });
  }

  lines.push(`${item.name}  ->  HTTP ${res.status}`);
  for (const r of results) {
    lines.push(`   ${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : "  <<< " + r.err}`);
    r.ok ? pass++ : fail++;
  }
  if (!script) lines.push("   (khong co test script)");
}

console.log(lines.join("\n"));
console.log(`\nTong: ${pass} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
