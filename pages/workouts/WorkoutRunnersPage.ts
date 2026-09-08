import { type Page, type Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class WorkoutRunnersPage extends BasePage {
  readonly heading: Locator;
  readonly backToWorkoutsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Workouts Runners', level: 1 });
    this.backToWorkoutsButton = page.getByRole('button', { name: 'Back To Workouts' });
  }

  async goto(meetingId: string) {
    await super.goto(`/workouts?meetingid=${meetingId}`);
    await this.heading.waitFor();
  }
}
