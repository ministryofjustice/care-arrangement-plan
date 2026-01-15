import { Page, Locator } from '@playwright/test';

export class PasswordPage {
  readonly page: Page;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.passwordInput = page.getByLabel(/password/i);
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.errorSummary = page.locator('.govuk-error-summary');
  }

  async goto() {
    await this.page.goto('/password');
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.continueButton.click();
  }

  async submitWithPassword(password: string) {
    await this.enterPassword(password);
    await this.submit();
  }
}

export class SafetyCheckPage {
  readonly page: Page;
  readonly yesRadio: Locator;
  readonly noRadio: Locator;
  readonly continueButton: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yesRadio = page.getByLabel(/yes/i);
    this.noRadio = page.getByLabel(/no/i);
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.errorSummary = page.locator('.govuk-error-summary');
  }

  async goto() {
    await this.page.goto('/safety-check');
  }

  async selectYes() {
    await this.yesRadio.first().check();
  }

  async selectNo() {
    await this.noRadio.first().check();
  }

  async submit() {
    await this.continueButton.click();
  }
}

export class TaskListPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.continueButton = page.getByRole('button', { name: /continue/i });
  }

  async goto() {
    await this.page.goto('/make-a-plan');
  }

  async getSectionStatus(sectionName: string) {
    const section = this.page.getByText(sectionName).first();
    const parent = section.locator('..');
    return await parent.textContent();
  }

  async clickSection(sectionName: string) {
    const sectionLink = this.page.getByRole('link', { name: new RegExp(sectionName, 'i') });
    await sectionLink.first().click();
  }
}

export class AboutTheChildrenPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobDayInput: Locator;
  readonly dobMonthInput: Locator;
  readonly dobYearInput: Locator;
  readonly continueButton: Locator;
  readonly errorSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.dobDayInput = page.locator('input[name="dateOfBirth-day"]');
    this.dobMonthInput = page.locator('input[name="dateOfBirth-month"]');
    this.dobYearInput = page.locator('input[name="dateOfBirth-year"]');
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.errorSummary = page.locator('.govuk-error-summary');
  }

  async goto() {
    await this.page.goto('/about-the-children');
  }

  async fillChildDetails(firstName: string, lastName: string, day: string, month: string, year: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.dobDayInput.fill(day);
    await this.dobMonthInput.fill(month);
    await this.dobYearInput.fill(year);
  }

  async submit() {
    await this.continueButton.click();
  }
}
