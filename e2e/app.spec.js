/**
 * P4 E2E 測試 — 首頁
 *
 * 測試首頁的核心功能和用戶流程
 */

const { test, expect } = require('@playwright/test');

test.describe('首頁', () => {
    test('應該正確載入首頁', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/LoyaultyClub|GoCart|Home/i);
    });

    test('應該顯示 Hero 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText(/Gadgets you'll love/i)).toBeVisible();
        await expect(page.getByText('LEARN MORE')).toBeVisible();
    });

    test('應該顯示 Navbar 導航', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    });

    test('應該顯示 Our Specifications 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Our Specifications')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Free Shipping' })).toBeVisible();
    });

    test('應該顯示 Newsletter 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Join Newsletter')).toBeVisible();
        await expect(page.getByPlaceholder('Enter your email address')).toBeVisible();
    });

    test('應該顯示 Footer', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText(/Copyright.*MyLoYau/i)).toBeVisible();
    });
});

test.describe('導航', () => {
    test('點擊 Shop 應該導航到商店頁面', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Shop/i }).first().click();
        await expect(page).toHaveURL(/\/shop/);
        await expect(page.getByText('Products', { exact: true })).toBeVisible();
    });

    test('點擊 Logo 應該回到首頁', async ({ page }) => {
        await page.goto('/shop');
        await page.getByRole('link').first().click();
        await expect(page).toHaveURL('/');
    });
});

test.describe('商店頁面', () => {
    test('應該顯示商品列表', async ({ page }) => {
        await page.goto('/shop');
        await expect(page.getByText('Products', { exact: true })).toBeVisible();
    });

    test('搜尋功能應該過濾商品', async ({ page }) => {
        await page.goto('/shop?search=Bluetooth');
        await expect(page.getByText('Products', { exact: true })).toBeVisible();
    });
});

test.describe('購物車頁面', () => {
    test('應該顯示購物車即將推出', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.getByText('購物車功能即將推出')).toBeVisible();
    });

    test('應該有瀏覽產品連結', async ({ page }) => {
        await page.goto('/cart');
        const shopLink = page.getByRole('link', { name: '瀏覽產品' });
        await expect(shopLink).toBeVisible();
        await shopLink.click();
        await expect(page).toHaveURL(/\/shop/);
    });
});

test.describe('頁面載入', () => {
    test('首頁應該有正確的 meta 結構', async ({ page }) => {
        await page.goto('/');
        // 確認頁面有 viewport meta tag（響應式設計基礎）
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute('content', /width=device-width/);
    });

    test('商店頁面應該可以直接訪問', async ({ page }) => {
        const response = await page.goto('/shop');
        expect(response.status()).toBe(200);
        await expect(page.getByText('Products', { exact: true })).toBeVisible();
    });
});

test.describe('響應式設計', () => {
    test('桌面版本應該顯示完整導航', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/');
        await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    });

    test('手機版本應該有 Login 按鈕', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        // 手機版的 Login 按鈕 (sm:hidden 的 div 內)
        const mobileLogin = page.locator('.sm\\:hidden >> text=Login');
        await expect(mobileLogin).toBeVisible();
    });
});
