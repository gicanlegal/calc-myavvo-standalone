import { test, expect } from '@playwright/test';

test.describe('Calculator Taxă de Stat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Taxă de Stat' }).click();
  });

  test('calculează taxă patrimonială pentru persoană fizică', async ({ page }) => {
    // Persoană fizică e default
    await page.locator('input[type="number"]').first().fill('100000');
    await page.getByRole('button', { name: 'Calculează Taxă' }).click();

    // Rezultatul apare — folosim exact match pentru a evita tab-ul
    await expect(page.getByText('Taxă de stat', { exact: true })).toBeVisible();
    await expect(page.getByText('MDL').first()).toBeVisible();
    // Verificăm că apare secțiunea de detalii
    await expect(page.getByText('Detalii calcul')).toBeVisible();
  });

  test('calculează taxă nepatrimonială', async ({ page }) => {
    // Selectează nepatrimonială
    await page.locator('input[type="radio"][value="n"]').check();
    await page.getByRole('button', { name: 'Calculează Taxă' }).click();

    await expect(page.getByText('Taxă de stat', { exact: true })).toBeVisible();
    await expect(page.getByText('MDL').first()).toBeVisible();
  });

  test('schimbă instanța și recalculează', async ({ page }) => {
    await page.locator('input[type="number"]').first().fill('50000');
    // Selectează Apel
    await page.locator('input[type="radio"][value="0.85"]').check();
    await page.getByRole('button', { name: 'Calculează Taxă' }).click();

    await expect(page.getByText('Taxă de stat', { exact: true })).toBeVisible();
  });
});
