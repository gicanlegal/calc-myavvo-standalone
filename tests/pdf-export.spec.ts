import { test, expect } from '@playwright/test';

test.describe('Export PDF — fără crash', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('PDF Dobândă nu produce erori', async ({ page }) => {
    // Complectează formularul
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('15/01/2024');
    await page.locator('input[type="number"][placeholder="10000"]').first().fill('10000');
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('15/02/2024');
    await page.getByRole('button', { name: 'Calculează Dobânda' }).click();

    // Așteaptă rezultatul
    await expect(page.getByText('Dobânda legală')).toBeVisible();

    // Interceptează console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Click PDF
    await page.getByRole('button', { name: 'Descarcă PDF' }).click();
    await page.waitForTimeout(2000);

    expect(errors.filter(e => e.includes('PDF') || e.includes('jspdf'))).toHaveLength(0);
  });

  test('PDF Zile nu produce erori', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculator Zile' }).click();
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('01/01/2024');
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('10/01/2024');
    await page.getByRole('button', { name: 'Calculează' }).click();

    await expect(page.getByText('zile totale')).toBeVisible();

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.getByRole('button', { name: 'Descarcă PDF' }).click();
    await page.waitForTimeout(2000);

    expect(errors.filter(e => e.includes('PDF') || e.includes('jspdf'))).toHaveLength(0);
  });

  test('PDF Taxă nu produce erori', async ({ page }) => {
    await page.getByRole('button', { name: 'Taxă de Stat' }).click();
    await page.locator('input[type="number"]').fill('100000');
    await page.getByRole('button', { name: 'Calculează Taxă' }).click();

    await expect(page.getByText('Taxă de stat', { exact: true })).toBeVisible();

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.getByRole('button', { name: 'Descarcă PDF' }).click();
    await page.waitForTimeout(2000);

    expect(errors.filter(e => e.includes('PDF') || e.includes('jspdf'))).toHaveLength(0);
  });
});
