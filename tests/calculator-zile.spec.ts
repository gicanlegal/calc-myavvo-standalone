import { test, expect } from '@playwright/test';

test.describe('Calculator Zile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Calculator Zile' }).click();
  });

  test('calculează zile între două date', async ({ page }) => {
    // Complectează start date
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('01/01/2024');
    // Complectează end date
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('10/01/2024');
    // Calculează
    await page.getByRole('button', { name: 'Calculează' }).click();

    // Rezultatul apare — numărul mare din card (9 zile pentru că includeFirst e false by default)
    await expect(page.locator('div.text-5xl').first()).toHaveText('9');
    await expect(page.getByText('zile totale')).toBeVisible();
    await expect(page.getByText('lucrătoare')).toBeVisible();
  });

  test('mod Data + Zile funcționează', async ({ page }) => {
    // Selectează modul Data + Zile
    await page.getByRole('button', { name: 'Data + Zile' }).click();
    // Start date
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('01/01/2024');
    // Adaugă 10 zile
    await page.locator('input[type="number"]').nth(2).fill('10');
    // Calculează
    await page.getByRole('button', { name: 'Calculează' }).click();

    await expect(page.getByText('zile totale')).toBeVisible();
  });

  test('opțiunea "Include prima zi" modifică rezultatul', async ({ page }) => {
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('01/01/2024');
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('02/01/2024');

    // Fără include prima zi (default)
    await page.getByRole('button', { name: 'Calculează' }).click();
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();

    // Cu include prima zi
    await page.getByLabel('Include prima zi').check();
    await page.getByRole('button', { name: 'Calculează' }).click();
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  });
});
