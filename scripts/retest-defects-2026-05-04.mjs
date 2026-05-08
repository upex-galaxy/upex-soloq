import { chromium } from 'playwright';

const base = process.env.SOLOQ_BASE_URL || 'https://staging-upexsoloq.vercel.app';
const email = process.env.SOLOQ_QA_EMAIL || 'demo@soloq.app';
const password = process.env.SOLOQ_QA_PASSWORD || 'Demo123!';

const result = { base, email, status: 'IN_PROGRESS', cases: [] };

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function runCase(key, name, fn) {
  try {
    const r = await fn();
    result.cases.push({ key, name, ...r });
  } catch (error) {
    result.cases.push({ key, name, result: 'FAIL', notes: String(error?.message || error) });
  }
}

try {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await Promise.all([
    page.getByTestId('login-submit-button').click(),
    page.waitForURL(url => url.pathname.includes('/dashboard') || url.pathname.includes('/invoices'), {
      timeout: 25000,
    }),
  ]);

  await runCase('SQ-169', 'No-results state differentiates from empty-account state', async () => {
    await page.goto(`${base}/invoices`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-testid="invoice-search-input"]', { timeout: 15000 });
    await page.getByTestId('invoice-search-input').fill('zzzz-not-found');
    await page.waitForTimeout(1200);

    const hasZero = await page.locator('text=0 facturas encontradas').first().isVisible().catch(() => false);
    const hasEmpty = await page.locator('text=No tienes facturas aun').first().isVisible().catch(() => false);

    return {
      result: hasZero && !hasEmpty ? 'PASS' : 'FAIL',
      notes: `zeroResults=${hasZero}; emptyCopy=${hasEmpty}`,
    };
  });

  await runCase('SQ-177', 'Status filter persists in URL after reload', async () => {
    await page.goto(`${base}/invoices`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);
    const paidTab = page.getByRole('tab', { name: /pagad/i }).first();
    const tabVisible = await paidTab.isVisible().catch(() => false);

    if (!tabVisible) {
      return { result: 'FAIL', notes: 'Paid tab not visible for this user/session' };
    }

    await paidTab.click();
    await page.waitForTimeout(1200);
    const urlAfterSelect = page.url();

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1200);
    const urlAfterReload = page.url();

    const ok = urlAfterSelect.includes('status=') && urlAfterReload.includes('status=');

    return {
      result: ok ? 'PASS' : 'FAIL',
      notes: `afterSelect=${urlAfterSelect}; afterReload=${urlAfterReload}`,
    };
  });

  await runCase('SQ-176', 'Overdue dashboard/list consistency smoke', async () => {
    await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const bodyText = await page.locator('body').innerText();
    const hasLabel = /Facturas Vencidas/i.test(bodyText);

    return {
      result: hasLabel ? 'PASS' : 'FAIL',
      notes: 'Smoke verification: overdue label present on dashboard',
    };
  });

  await runCase('SQ-175', 'Monthly summary visibility smoke', async () => {
    await page.goto(`${base}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);
    const bodyText = await page.locator('body').innerText();
    const hasMonthlySignals = /mensual|monthly|ingreso/i.test(bodyText);

    return {
      result: hasMonthlySignals ? 'PASS' : 'FAIL',
      notes: 'Smoke verification: monthly summary signals present in dashboard UI',
    };
  });

  await runCase('SQ-173', 'Payment method label association', async () => ({
    result: 'FAIL',
    notes: 'Blocked in this run: deterministic modal trigger + controlled payment candidate invoice unavailable for stable automation assertion',
  }));

  await runCase('SQ-174', 'paid_at/event consistency after payment registration', async () => ({
    result: 'FAIL',
    notes: 'Blocked in this run: requires controlled payment transaction plus DB verification dataset',
  }));

  result.status = 'DONE';
} catch (error) {
  result.status = 'BLOCKED';
  result.error = String(error?.message || error);
} finally {
  await context.close();
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
