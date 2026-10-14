const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, fetch) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(js, { exports, fetch, AbortSignal, Error, URLSearchParams });
  return exports;
}
const reply = (status, data) => new Response(JSON.stringify(data), { status });

test('maps only confirmed list routes and preserves pagination', () => {
  const { adminEndpoints, normalizeAdminEnvelope } = load('lib/admin-endpoints.ts');
  assert.equal(adminEndpoints.orders, '/admin/orders/list');
  assert.equal(adminEndpoints.users, '/admin/users/list');
  const result = normalizeAdminEnvelope({ status: 'success', data: { data: [{ id: 'one' }], meta: { totalCount: 44, currentPage: 2, pageCount: 5 } } });
  assert.equal(result.data[0].id, 'one');
  assert.equal(result.meta.total, 44);
  assert.equal(result.meta.page, 2);
  assert.equal(result.meta.lastPage, 5);
});

test('successful login verifies dedicated admin profile', async () => {
  const calls = [];
  const { requestAdminAuth } = load('lib/admin-auth.ts', async (url, options) => {
    calls.push({ url, options });
    return reply(200, { status: 'success', data: calls.length === 1 ? { token: 'test-token' } : { id: 'admin-id', role: 'admin' } });
  });
  const result = await requestAdminAuth('https://test.invalid', 'login', { email: 'admin@example.test', password: 'not-a-real-password' });
  assert.equal(result.ok, true);
  assert.equal(calls[1].url, 'https://test.invalid/auth/admin/me');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer test-token');
});

for (const status of [401, 403, 404, 500]) {
  test(`auth ${status} never falls back to vendor login`, async () => {
    let calls = 0;
    const { requestAdminAuth } = load('lib/admin-auth.ts', async () => { calls++; return reply(status, {}); });
    const result = await requestAdminAuth('https://test.invalid', 'login', { email: 'admin@example.test', password: 'test' });
    assert.equal(result.ok, false);
    assert.equal(calls, 1);
    assert.equal(result.status, status === 404 ? 503 : status);
  });
}

test('rejects non-admin session and missing token', async () => {
  const { requestAdminAuth } = load('lib/admin-auth.ts', async () => reply(200, { status: 'success', data: { id: 'vendor', role: 'vendor' } }));
  assert.equal((await requestAdminAuth('https://test.invalid', 'me', { token: 'test' })).status, 403);
  assert.equal((await requestAdminAuth('https://test.invalid', 'login', { email: 'a', password: 'b' })).status, 502);
});

test('malformed auth response is not an authenticated session', async () => {
  const { requestAdminAuth } = load('lib/admin-auth.ts', async () => new Response('<html>error</html>'));
  assert.equal((await requestAdminAuth('https://test.invalid', 'me', { token: 'test' })).ok, false);
});

test('chart filters send year, and month only for retention; all omits filters', () => {
  const { chartPath } = load('lib/admin-metrics.ts');
  assert.equal(chartPath('signups', '2025'), 'overview/signups?year=2025');
  assert.equal(chartPath('merchant-growth', 'all'), 'overview/merchant-growth');
  assert.equal(chartPath('retention', '2026', '10'), 'overview/retention?year=2026&month=10');
  assert.equal(chartPath('retention', 'all', 'all'), 'overview/retention');
  assert.equal(chartPath('signups', '2026', '10'), 'overview/signups?year=2026');
});

test('both finance requests use documented range values, not from dates', () => {
  const { financePath, financeRanges } = load('lib/admin-metrics.ts');
  for (const { value } of financeRanges) {
    assert.ok(['7d', '30d', '90d', '12m'].includes(value));
    assert.equal(financePath('metrics', value), 'finance/metrics?range=' + value);
    assert.equal(financePath('gateway-volume', value), 'finance/gateway-volume?range=' + value);
  }
});

test('chart adapter preserves zero, empty data and backend growth percentage', () => {
  const { parseChart } = load('lib/admin-metrics.ts');
  assert.equal(parseChart({ chartData: [] }).chartData.length, 0);
  const data = parseChart({ chartData: [{ label: 'Jan', value: 0 }], momGrowth: '-89%' });
  assert.equal(data.chartData[0].value, 0);
  assert.equal(data.momGrowth, '-89%');
  assert.throws(() => parseChart({ chartData: [{ label: 'Jan', value: 'bad' }] }));
});

test('finance adapters map documented fields without fabricating missing metrics', () => {
  const { parseFinance, parseGateways } = load('lib/admin-metrics.ts');
  const payload = Object.fromEntries(['platformRevenue', 'markupFees', 'transactionFees', 'pendingSettlements'].map(k => [k, { amount: 0, trend: -100 }]));
  assert.equal(parseFinance(payload)[0].value, 0);
  assert.equal(parseFinance(payload)[0].trend, -100);
  assert.equal(parseGateways([{ name: 'Paystack', percentage: 100 }])[0].percentage, 100);
  assert.throws(() => parseFinance({}));
  assert.throws(() => parseGateways([{ name: 'Paystack', percentage: 200 }]));
});

test('overview cards own independent year filters and retention month', () => {
  const React = require('react');
  const state = [];
  let cursor = 0;
  let requests = [];
  const exports = {};
  const metrics = load('lib/admin-metrics.ts');
  const source = fs.readFileSync('app/(dashboard)/overview/page.tsx', 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(js, { exports, require: (name) => {
    if (name === 'react/jsx-runtime') return require(name);
    if (name === 'react') return { useState: initial => {
      const index = cursor++;
      if (state[index] === undefined) state[index] = initial;
      return [state[index], value => { state[index] = value; }];
    } };
    if (name === '@/lib/admin-metrics') return metrics;
    if (name === '@/lib/use-admin-metric') return { useAdminMetric: path => {
      requests.push(path);
      return { data: null, loading: false, error: null, refresh() {} };
    } };
    return new Proxy({}, { get: (_, key) => String(key) });
  } });
  function render() {
    cursor = 0;
    requests = [];
    return exports.default();
  }
  function find(node, label) {
    if (!React.isValidElement(node)) return null;
    if (node.type === 'select' && node.props['aria-label'] === label) return node;
    for (const child of React.Children.toArray(node.props.children)) {
      const match = find(child, label);
      if (match) return match;
    }
    return null;
  }
  let tree = render();
  const initial = [...requests];
  for (const label of ['Merchant growth year', 'Signups year', 'Retention year', 'Retention month']) {
    assert.ok(find(tree, label), label);
  }
  find(tree, 'Merchant growth year').props.onChange({ target: { value: '2024' } });
  tree = render();
  assert.equal(requests[0], 'overview/merchant-growth?year=2024');
  assert.equal(requests[1], initial[1]);
  assert.equal(requests[2], initial[2]);
  find(tree, 'Retention year').props.onChange({ target: { value: 'all' } });
  find(tree, 'Retention month').props.onChange({ target: { value: '3' } });
  tree = render();
  assert.equal(requests[2], 'overview/retention?month=3');
  find(tree, 'Signups year').props.onChange({ target: { value: 'all' } });
  render();
  assert.equal(requests[1], 'overview/signups');
});

test('admin data module contains types only, with no runtime sample datasets', () => {
  const source = ts.createSourceFile('admin-data.ts', fs.readFileSync('lib/admin-data.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  assert.ok(source.statements.length > 0);
  assert.ok(source.statements.every(ts.isInterfaceDeclaration));
  for (const file of ['subscriptions', 'support', 'settings']) {
    const page = fs.readFileSync(`app/(dashboard)/${file}/page.tsx`, 'utf8');
    assert.doesNotMatch(page, /adminSubscriptions|adminTickets|adminStaff|Date\.now\(\)|export queued/);
  }
  assert.doesNotMatch(fs.readFileSync('lib/admin-client.ts', 'utf8'), /useRowsOrFallback/);
});
