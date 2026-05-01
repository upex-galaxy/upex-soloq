import { chromium } from 'playwright';

const BASE_URL = process.env.SOLOQ_BASE_URL || 'https://staging-upexsoloq.vercel.app';
const EMAIL = process.env.SOLOQ_QA_EMAIL || 'demo@soloq.app';
const PASSWORD = process.env.SOLOQ_QA_PASSWORD || 'Demo123!';

async function waitInvoicesSearchResponse(page) {
  try {
    await page.waitForResponse(
      response => response.url().includes('/api/invoices') && response.request().method() === 'GET',
      { timeout: 15000 }
    );
  } catch {
    // keep flow resilient; UI assertions will capture failure if any
  }
}

const result = {
  baseUrl: BASE_URL,
  status: 'IN_PROGRESS',
  scenarios: [],
  notes: [],
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

try {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.getByTestId('login-email-input').fill(EMAIL);
  await page.getByTestId('login-password-input').fill(PASSWORD);

  await Promise.all([
    page.getByTestId('login-submit-button').click(),
    page.waitForURL(
      url => url.pathname.includes('/dashboard') || url.pathname.includes('/invoices'),
      {
        timeout: 20000,
      }
    ),
  ]);

  await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-testid="invoice-search-input"]', { timeout: 15000 });

  result.scenarios.push({ name: 'Search input visible', status: 'PASS' });

  // Scenario: exact match
  await page.getByTestId('invoice-search-input').fill('INV-2026-20354');
  await waitInvoicesSearchResponse(page);
  await page.waitForTimeout(500);

  const exactRowVisible = await page
    .locator('text=INV-2026-20354')
    .first()
    .isVisible()
    .catch(() => false);
  result.scenarios.push({
    name: 'Exact invoice search',
    status: exactRowVisible ? 'PASS' : 'FAIL',
  });

  // Scenario: no results copy/state
  await page.getByTestId('invoice-search-input').fill('zzzz-not-found');
  await waitInvoicesSearchResponse(page);
  await page.waitForTimeout(500);

  const zeroResultsVisible = await page
    .locator('text=0 facturas encontradas')
    .first()
    .isVisible()
    .catch(() => false);
  const emptyCopyVisible = await page
    .locator('text=No tienes facturas aun')
    .first()
    .isVisible()
    .catch(() => false);
  const noResultsContainerText = await page
    .getByTestId('invoice-empty-state')
    .innerText()
    .catch(() => null);

  result.scenarios.push({
    name: 'No results state rendered',
    status: zeroResultsVisible ? 'PASS' : 'FAIL',
  });

  if (zeroResultsVisible && emptyCopyVisible) {
    result.notes.push(
      'Observed mixed state: zero-results counter with empty-account copy (matches SQ-169).'
    );
  }

  if (noResultsContainerText) {
    result.notes.push(
      `No-results container text: ${noResultsContainerText.replace(/\s+/g, ' ').trim()}`
    );
  }

  // Scenario: clear search
  const clearButton = page.getByTestId('search-clear-button');
  if (await clearButton.isVisible().catch(() => false)) {
    await clearButton.click();
    await waitInvoicesSearchResponse(page);
  } else {
    await page.getByTestId('invoice-search-input').fill('');
    await waitInvoicesSearchResponse(page);
  }
  await page.waitForTimeout(400);

  const listVisible = await page
    .getByTestId('invoice-list')
    .isVisible()
    .catch(() => false);
  result.scenarios.push({
    name: 'Clear search restores list',
    status: listVisible ? 'PASS' : 'FAIL',
  });

  await page.screenshot({
    path: 'artifacts/sq51-ui-exploratory-2026-04-12.png',
    fullPage: true,
  });

  const failed = result.scenarios.filter(s => s.status === 'FAIL').length;
  result.status = failed > 0 ? 'ISSUES_FOUND' : 'PASSED';
} catch (error) {
  result.status = 'BLOCKED';
  result.notes.push(`Execution error: ${error.message}`);
} finally {
  await context.close();
  await browser.close();
}

console.log(JSON.stringify(result, null, 2));
