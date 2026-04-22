import { test, expect } from '@playwright/test';

test.describe('Calculator Dobândă Legală', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Tab-ul default e Dobândă Legală
  });

  test('afișează eroare când lipsesc datele', async ({ page }) => {
    await page.getByRole('button', { name: 'Calculează Dobânda' }).click();
    await expect(page.getByText('Adăugați cel puțin o sumă scadentă')).toBeVisible();
  });

  test('calculează dobânda pentru o sumă simplă', async ({ page }) => {
    // Data scadență
    await page.getByPlaceholder('zz/ll/aaaa').first().fill('15/01/2024');
    // Suma scadență
    await page.locator('input[type="number"][placeholder="10000"]').first().fill('10000');
    // Data calcul
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('15/02/2024');

    await page.getByRole('button', { name: 'Calculează Dobânda' }).click();

    // Rezultatul apare
    await expect(page.getByText('Dobânda legală')).toBeVisible();
    await expect(page.locator('text=/\\d+[.,]?\\d*\\s*MDL/')).toBeVisible();
    // Tabelul de rezultate apare
    await expect(page.locator('table')).toBeVisible();
  });

  test('adaugă și șterge o plată', async ({ page }) => {
    await page.getByRole('button', { name: '+ Adaugă Plată' }).click();
    await page.getByPlaceholder('zz/ll/aaaa').nth(1).fill('20/01/2024');
    await page.locator('input[type="number"][placeholder="5000"]').first().fill('5000');

    // Așteptăm ca butonul de ștergere al plății să apară (scadența fiind singură nu are ștergere)
    const deleteBtns = page.locator('button').filter({ hasText: 'Șterge' });
    await expect(deleteBtns).toHaveCount(1);

    // Șterge plată
    await deleteBtns.first().click();

    // Verificăm că butonul de ștergere a dispărut
    await expect(deleteBtns).toHaveCount(0);
  });
});
