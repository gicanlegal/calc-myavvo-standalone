import { test, expect } from '@playwright/test';

test.describe('Smoke — UI de bază', () => {
  test('pagina se încarcă și afișează brandingul', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('CalcJuridic.')).toBeVisible();
    await expect(page.getByText('myAVVO — Hub Juridic Moldova').first()).toBeVisible();
  });

  test('toate cele 4 tab-uri sunt vizibile și navigabile', async ({ page }) => {
    await page.goto('/');
    const tabs = ['Dobândă Legală', 'Penalitate', 'Taxă de Stat', 'Calculator Zile'];
    for (const label of tabs) {
      const btn = page.getByRole('button', { name: label, exact: true });
      await expect(btn).toBeVisible();
      await btn.click();
      // Verificăm că butonul activ are stilul gradient (class conține linear-gradient)
      await expect(btn).toHaveClass(/linear-gradient/);
    }
  });

  test('dark/light mode toggle funcționează', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(toggle).toBeVisible();

    // Verificăm tema inițială
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(initialTheme);

    await toggle.click();
    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('ratele BNM se încarcă sau afișează status', async ({ page }) => {
    await page.goto('/');
    const bnmBlock = page.locator('text=BNM:');
    await expect(bnmBlock).toBeVisible();
    // Așteptăm puțin pentru încărcare
    await page.waitForTimeout(3000);
    // Fie avem număr de rate, fie un mesaj de eroare — ambele sunt OK
    const text = await page.locator('text=/BNM:/').first().textContent();
    expect(text).toMatch(/BNM:\s*\d+\s*rate/);
  });
});
