import { test, expect } from '@playwright/test';

test.describe('Calculator Penalitate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Penalitate' }).click();
  });

  test('afișează eroare când lipsesc datele', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculează Penalitatea' }).click();
    await expect(page.getByText('Adăugați cel puțin o sumă scadentă!')).toBeVisible();
  });

  test('calculează penalitate pentru o sumă simplă', async ({ page }) => {
    // Data scadență
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('15/01/2024');
    // Suma
    await page.locator('input[type="number"][placeholder="10000"]').first().fill('10000');
    // Data calcul
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('15/02/2024');

    await page.getByRole('button', { name: 'Calculează Penalitatea' }).click();

    // Rezultatul apare
    await expect(page.getByText('Penalitate totală')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('aplică limita de 180 zile', async ({ page }) => {
    await page.locator('input[type="radio"][value="180"]').check();
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('01/01/2023');
    await page.locator('input[type="number"][placeholder="10000"]').first().fill('10000');
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('01/01/2024');

    await page.getByRole('button', { name: 'Calculează Penalitatea' }).click();

    await expect(page.getByText('Penalitate totală')).toBeVisible();
    // Verificăm că nu e eroare și tabelul apare
    await expect(page.locator('table')).toBeVisible();
  });
});
