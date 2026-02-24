import { expect, type Page } from '@playwright/test';

export class ToolPage {
  constructor(private page: Page, private path: string) {}

  async goto() {
    await this.page.goto(`/${this.path}`);
  }

  async expectSafetyBadge() {
    await expect(this.page.getByRole('button', { name: 'セキュリティ情報を表示' })).toBeVisible();
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
