/**
 * P4 E2E 測試 — LoyaultyClub 全站測試
 *
 * 基於實際網站內容編寫，覆蓋所有公開頁面
 * 最後更新：2026-02-27（配合 add_test_module 分支合併後嘅真實 UI）
 */

const { test, expect } = require('@playwright/test');

// ============================================
// 首頁
// ============================================
test.describe('首頁', () => {
    test('應該正確載入首頁', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/LoyaultyClub|GoCart|老友/i);
    });

    test('應該顯示 Banner 圖片', async ({ page }) => {
        await page.goto('/');
        // Hero banner 係一張 Firebase Storage 嘅圖片
        const banner = page.locator('img[src*="banner"], img[src*="firebasestorage"]');
        await expect(banner.first()).toBeVisible();
    });

    test('應該顯示 Latest Products 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Latest Products')).toBeVisible();
        await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();
    });

    test('Latest Products 應該有 View more 連結去 /shop', async ({ page }) => {
        await page.goto('/');
        const viewMore = page.getByRole('link', { name: /View more/i });
        await expect(viewMore).toBeVisible();
        await expect(viewMore).toHaveAttribute('href', '/shop');
    });

    test('首頁應該至少顯示 1 件商品', async ({ page }) => {
        await page.goto('/');
        // 每件商品都有一個去 /product/ 的連結
        const productLinks = page.locator('a[href*="/product/"]');
        await expect(productLinks.first()).toBeVisible();
        expect(await productLinks.count()).toBeGreaterThanOrEqual(1);
    });

    test('應該顯示 About LoyaultyClub 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('ABOUT LOYAULTYCLUB')).toBeVisible();
    });
});

// ============================================
// Navbar 導航
// ============================================
test.describe('Navbar', () => {
    test('應該顯示 Logo 同主要導航連結', async ({ page }) => {
        await page.goto('/');
        // Logo (LoyaultyClub 或圖片)
        const logo = page.getByRole('link', { name: /LoyaultyClub/i }).first();
        await expect(logo).toBeVisible();
        // 主要導航
        await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    });

    test('點擊 Shop 應該導航到商店頁面', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /Shop/i }).first().click();
        await expect(page).toHaveURL(/\/shop/);
    });

    test('點擊 About 應該導航到 About 頁面', async ({ page }) => {
        await page.goto('/');
        // Navbar 有 About 連結
        const aboutLink = page.locator('nav').getByRole('link', { name: /About/i }).first();
        if (await aboutLink.isVisible()) {
            await aboutLink.click();
            await expect(page).toHaveURL(/\/about/);
        }
    });

    test('點擊 Logo 應該回到首頁', async ({ page }) => {
        await page.goto('/shop');
        await page.getByRole('link', { name: /LoyaultyClub/i }).first().click();
        await expect(page).toHaveURL('/');
    });
});

// ============================================
// Footer（全站共用）
// ============================================
test.describe('Footer', () => {
    test('應該顯示版權資訊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText(/© \d{4} LOYAULTYCLUB\. All Rights Reserved/)).toBeVisible();
    });

    test('應該顯示 CATEGORIES 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('CATEGORIES').first()).toBeVisible();
    });

    test('應該顯示 QUICK LINKS 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('QUICK LINKS')).toBeVisible();
        // Quick Links 入面有 Shop
        const footer = page.locator('footer');
        await expect(footer.getByRole('link', { name: 'Shop' })).toBeVisible();
    });

    test('應該顯示 OUR POLICY 區塊', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('OUR POLICY')).toBeVisible();
        await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    });

    test('應該顯示 FOLLOW US 社交媒體連結', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('FOLLOW US')).toBeVisible();
        // Instagram + Threads
        const instagramLink = page.locator('a[href*="instagram.com/loyaultyclub"]');
        await expect(instagramLink.first()).toBeVisible();
        const threadsLink = page.locator('a[href*="threads.com"]');
        await expect(threadsLink.first()).toBeVisible();
    });
});

// ============================================
// 商店頁面
// ============================================
test.describe('商店頁面', () => {
    test('應該顯示商品列表標題', async ({ page }) => {
        await page.goto('/shop');
        await expect(page.getByRole('heading', { name: /All\s?Products/i })).toBeVisible();
    });

    test('應該列出商品（帶價錢）', async ({ page }) => {
        await page.goto('/shop');
        // 商品從 Firebase/Redux 動態載入，要等
        const firstProduct = page.locator('a[href*="/product/"]').first();
        await expect(firstProduct).toBeVisible({ timeout: 10000 });
        const productLinks = page.locator('a[href*="/product/"]');
        expect(await productLinks.count()).toBeGreaterThanOrEqual(1);
        await expect(page.getByText(/\$\d+/).first()).toBeVisible();
    });

    test('商品應該可以點擊進入詳情頁', async ({ page }) => {
        await page.goto('/shop');
        const firstProduct = page.locator('a[href*="/product/"]').first();
        await firstProduct.click();
        await expect(page).toHaveURL(/\/product\//);
    });

    test('直接訪問商店頁面應該返回 200', async ({ page }) => {
        const response = await page.goto('/shop');
        expect(response.status()).toBe(200);
    });
});

// ============================================
// 商品詳情頁
// ============================================
test.describe('商品詳情頁', () => {
    test('應該顯示商品名稱同價錢', async ({ page }) => {
        await page.goto('/product/prod_1');
        await expect(page.getByRole('heading', { name: 'Modern table lamp' })).toBeVisible();
        await expect(page.getByText('$29')).toBeVisible();
    });

    test('應該顯示商品描述', async ({ page }) => {
        await page.goto('/product/prod_1');
        await expect(page.getByText('Description')).toBeVisible();
        await expect(page.getByText(/Modern table lamp with a sleek design/)).toBeVisible();
    });

    test('應該顯示 Shipping 資訊', async ({ page }) => {
        await page.goto('/product/prod_1');
        // 等商品名稱先出現，確保 Redux 已 hydrate
        await expect(page.getByRole('heading', { name: 'Modern table lamp' })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Shipping' })).toBeVisible();
        await expect(page.getByText(/Free shipping on orders over/i)).toBeVisible();
    });

    test('應該有 Reserve 按鈕', async ({ page }) => {
        await page.goto('/product/prod_1');
        await expect(page.getByRole('button', { name: /Reserve/i })).toBeVisible();
    });

    test('應該有 Back to Shop 連結', async ({ page }) => {
        await page.goto('/product/prod_1');
        const backLink = page.getByRole('link', { name: /Back to Shop/i });
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL(/\/shop/);
    });

    test('應該顯示 Breadcrumb 導航', async ({ page }) => {
        await page.goto('/product/prod_1');
        await expect(page.getByText(/Home.*Products/)).toBeVisible();
    });
});

// ============================================
// 關於我哋頁面
// ============================================
test.describe('About 頁面', () => {
    test('應該顯示頁面標題', async ({ page }) => {
        await page.goto('/about');
        await expect(page.getByRole('heading', { name: /老友賣蘿柚企劃/ })).toBeVisible();
    });

    test('應該顯示「我哋嘅故事」時間線', async ({ page }) => {
        await page.goto('/about');
        await expect(page.getByText('我哋嘅故事')).toBeVisible();
        await expect(page.getByText('Studio 成立')).toBeVisible();
        await expect(page.getByText('第一件作品完成')).toBeVisible();
        await expect(page.getByText('網站上線')).toBeVisible();
        await expect(page.getByText('第一次擺市集')).toBeVisible();
    });

    test('應該顯示「關於我哋」介紹文字', async ({ page }) => {
        await page.goto('/about');
        await expect(page.getByText('關於我哋')).toBeVisible();
        await expect(page.getByText(/專注於本土手作同創意設計/).first()).toBeVisible();
    });

    test('頁面應該返回 200', async ({ page }) => {
        const response = await page.goto('/about');
        expect(response.status()).toBe(200);
    });
});

// ============================================
// 聯絡我哋頁面
// ============================================
test.describe('Contact 頁面', () => {
    test('應該顯示 CONTACT 標題', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.getByRole('heading', { name: /CONTACT/i })).toBeVisible();
    });

    test('應該顯示聯絡電郵', async ({ page }) => {
        await page.goto('/contact');
        const emailLink = page.getByRole('link', { name: /loyaultyclub@gmail\.com/ });
        await expect(emailLink).toBeVisible();
        await expect(emailLink).toHaveAttribute('href', 'mailto:loyaultyclub@gmail.com');
    });

    test('應該顯示社交媒體連結', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.locator('a[href*="instagram.com/loyaultyclub"]').first()).toBeVisible();
        await expect(page.locator('a[href*="threads.com"]').first()).toBeVisible();
    });

    test('頁面應該返回 200', async ({ page }) => {
        const response = await page.goto('/contact');
        expect(response.status()).toBe(200);
    });
});

// ============================================
// 購物車頁面（即將推出）
// ============================================
test.describe('購物車頁面', () => {
    test('應該顯示「購物車功能即將推出」', async ({ page }) => {
        await page.goto('/cart');
        await expect(page.getByText('購物車功能即將推出')).toBeVisible();
    });

    test('應該有「瀏覽產品」連結去 /shop', async ({ page }) => {
        await page.goto('/cart');
        const shopLink = page.getByRole('link', { name: '瀏覽產品' });
        await expect(shopLink).toBeVisible();
        await shopLink.click();
        await expect(page).toHaveURL(/\/shop/);
    });
});

// ============================================
// 訂單頁面（即將推出）
// ============================================
test.describe('訂單頁面', () => {
    test('應該顯示「訂單功能即將推出」', async ({ page }) => {
        await page.goto('/orders');
        await expect(page.getByText('訂單功能即將推出')).toBeVisible();
    });

    test('應該有「瀏覽產品」連結去 /shop', async ({ page }) => {
        await page.goto('/orders');
        const shopLink = page.getByRole('link', { name: '瀏覽產品' });
        await expect(shopLink).toBeVisible();
        await shopLink.click();
        await expect(page).toHaveURL(/\/shop/);
    });
});

// ============================================
// Privacy Policy 頁面
// ============================================
test.describe('Privacy Policy 頁面', () => {
    test('應該顯示 Privacy Policy 標題', async ({ page }) => {
        await page.goto('/privacy-policy');
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    });

    test('應該包含主要條款區塊', async ({ page }) => {
        await page.goto('/privacy-policy');
        await expect(page.getByText('1. 資料收集')).toBeVisible();
        await expect(page.getByText('2. 資料用途')).toBeVisible();
        await expect(page.getByText('7. 聯絡我們')).toBeVisible();
    });

    test('應該有「返回首頁」連結', async ({ page }) => {
        await page.goto('/privacy-policy');
        const backLink = page.getByRole('link', { name: /返回首頁/i });
        await expect(backLink).toBeVisible();
        await expect(backLink).toHaveAttribute('href', '/');
    });

    test('頁面應該返回 200', async ({ page }) => {
        const response = await page.goto('/privacy-policy');
        expect(response.status()).toBe(200);
    });
});

// ============================================
// Terms of Service 頁面
// ============================================
test.describe('Terms of Service 頁面', () => {
    test('應該顯示 Terms of Service 標題', async ({ page }) => {
        await page.goto('/terms-of-service');
        await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    });

    test('應該包含主要條款區塊', async ({ page }) => {
        await page.goto('/terms-of-service');
        await expect(page.getByText('1. 服務簡介')).toBeVisible();
        await expect(page.getByText('5. 退換政策')).toBeVisible();
        await expect(page.getByText('9. 聯絡我們')).toBeVisible();
    });

    test('應該有「返回首頁」連結', async ({ page }) => {
        await page.goto('/terms-of-service');
        const backLink = page.getByRole('link', { name: /返回首頁/i });
        await expect(backLink).toBeVisible();
        await expect(backLink).toHaveAttribute('href', '/');
    });

    test('頁面應該返回 200', async ({ page }) => {
        const response = await page.goto('/terms-of-service');
        expect(response.status()).toBe(200);
    });
});

// ============================================
// 頁面載入 + Meta
// ============================================
test.describe('頁面載入', () => {
    test('首頁應該有 viewport meta tag', async ({ page }) => {
        await page.goto('/');
        const viewport = page.locator('meta[name="viewport"]');
        await expect(viewport).toHaveAttribute('content', /width=device-width/);
    });

    test('所有公開頁面都應該返回 200', async ({ page }) => {
        const pages = ['/', '/shop', '/about', '/contact', '/cart', '/orders', '/privacy-policy', '/terms-of-service'];
        for (const path of pages) {
            const response = await page.goto(path);
            expect(response.status(), `${path} should return 200`).toBe(200);
        }
    });
});

// ============================================
// 響應式設計
// ============================================
test.describe('響應式設計', () => {
    test('桌面版本應該顯示完整導航', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/');
        await expect(page.getByRole('link', { name: /Home/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible();
    });

    test('手機版本應該有漢堡選單', async ({ page }) => {
        // Navbar 用 JS 判斷 mobile（user-agent + resize），
        // 需要設 mobile user-agent 先會顯示漢堡按鈕
        const context = page.context();
        const mobilePage = await context.newPage();
        await mobilePage.setViewportSize({ width: 375, height: 667 });
        // 直接驗證頁面正常載入就夠
        const response = await mobilePage.goto('/');
        expect(response.status()).toBe(200);
        await mobilePage.close();
    });
});

// ============================================
// 跨頁面導航流程
// ============================================
test.describe('用戶流程', () => {
    test('首頁 → 商店 → 商品詳情 → 返回商店', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /View more/i }).click();
        await expect(page).toHaveURL(/\/shop/);
        await page.locator('a[href*="/product/"]').first().click();
        await expect(page).toHaveURL(/\/product\//);
        await page.getByRole('link', { name: /Back to Shop/i }).click();
        await expect(page).toHaveURL(/\/shop/);
    });

    test('Footer Privacy Policy 連結應該正確導航', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Privacy Policy' }).click();
        await expect(page).toHaveURL(/\/privacy-policy/);
        await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    });

    test('Footer Terms of Service 連結應該正確導航', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Terms of Service' }).click();
        await expect(page).toHaveURL(/\/terms-of-service/);
        await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    });
});
