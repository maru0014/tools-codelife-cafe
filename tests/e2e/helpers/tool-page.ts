import { Page, expect } from '@playwright/test';

export class ToolPage {
  constructor(private page: Page, private path: string) {}

  async goto() {
    await this.page.goto(`/tools/${this.path}`);
  }

  async expectSafetyBadge() {
    await expect(this.page.getByText('サーバーと通信しません')).toBeVisible();
  }

  async expectTitle(title: string) {
    await expect(this.page).toHaveTitle(new RegExp(title));
  }

  async fillInput(text: string) {
    await this.page.getByRole('textbox').first().fill(text);
  }

  async expectOutputContains(text: string) {
    await expect(this.page.getByRole('textbox').last()).toContainText(text);
  }

  async clickCopy() {
    await this.page.getByRole('button', { name: /コピー/ }).click();
  }
}
