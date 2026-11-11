import { test, expect } from '../fixtures';
import { buildMessage } from './message-data';

test.describe(
  'Messages — API + UI',
  {
    tag: ['@messages'],
  },
  () => {
    // ============================================================
    // TC-MESSAGES-001: A contact message sent through the API is
    // listed by its subject in the admin inbox UI
    // ============================================================
    test(
      '[TC-MESSAGES-001] message sent through the API is listed in the admin inbox',
      {
        annotation: [{ type: 'test-case', description: 'TC-MESSAGES-001' }],
        tag: ['@smoke', '@positive'],
      },
      async ({ messageService, page }) => {
        const message = buildMessage();

        await test.step('Send a message through the API', async () => {
          const body = await messageService.send(message);
          expect(body.success).toBe(true);
        });

        await test.step('Log in to the admin panel', async () => {
          await page.goto('admin');
          await page.getByLabel('Username').fill(process.env.PLATFORM_ADMIN_USERNAME ?? '');
          await page.getByLabel('Password').fill(process.env.PLATFORM_ADMIN_PASSWORD ?? '');
          await page.getByRole('button', { name: 'Login' }).click();
          // The demo site can take longer than the default 5s to redirect after login
          await expect(page).toHaveURL(/admin\/rooms/, { timeout: 15_000 });
        });

        await test.step('Verify the message is listed in the inbox', async () => {
          await page.goto('admin/message');
          await expect(page.getByText(message.subject)).toBeVisible();
        });
      }
    );
  }
);
