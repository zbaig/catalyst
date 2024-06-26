import { expect, test } from '@playwright/test';

import { ProductActions } from '../../../../actions/product-actions';
import { CartPage } from '../../../../pages/cart-page';

const sampleProduct = '[Sample] Able Brewing System';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Main').getByRole('link', { name: 'Kitchen' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Kitchen' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: sampleProduct })).toBeVisible();
});

test('Add a single product to cart', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByText(sampleProduct, { exact: true })).toBeVisible();
});

test('Edit product quantity in cart', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByLabel('Increase count').click();

  await expect(page.getByRole('link', { name: 'Cart Items 2' })).toBeVisible();

  await page.getByLabel('Decrease count').click();
  await expect(page.getByRole('link', { name: 'Cart Items 1' })).toBeVisible();
});

test('Add coupon code', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).nth(1).click();

  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill('OFF25');
  await couponCodeBox.press('Enter');

  await expect(page.getByText('Coupon (OFF25)')).toBeVisible();
});

test('Coupon code is required', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).nth(1).click();

  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill('');
  await couponCodeBox.press('Enter');

  await expect(page.getByText('Please enter a coupon code.')).toBeVisible();
});

test('Coupon code fails', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to checkout' })).toBeVisible();

  await page.getByRole('button', { name: 'Add' }).nth(1).click();

  const couponCodeBox = page.getByPlaceholder('Enter your coupon code');

  await couponCodeBox.fill('INCORRECT_CODE');
  await couponCodeBox.press('Enter');

  await expect(page.getByText('The coupon code you entered is not valid.')).toBeVisible();
});

test('Proceed to checkout', async ({ page }) => {
  await ProductActions.addProductToCart(page, sampleProduct);

  await page.getByRole('link', { name: 'Cart Items 1' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Your cart' })).toBeVisible();
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();

  await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();

  await expect(
    page.locator(CartPage.CART_ITEM_DIV).filter({ hasText: `1 x ${sampleProduct}` }),
  ).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Shipping' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
});
