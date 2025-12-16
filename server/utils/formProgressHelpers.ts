import TASK_FLOW_MAP from '../config/flowConfig';

export function hasCompletedRequiredSteps(completedSteps: string[], requiredSteps: string[]): boolean {
  return requiredSteps.every(step => completedSteps.includes(step));
}

export function hasCompletedAlternativePath(completedSteps: string[], alternativePaths: string[][]): boolean {
  if (alternativePaths.length === 0) return true;
  return alternativePaths.some(path => path.every(step => completedSteps.includes(step)));
}

export function hasUserStartedJourney(completedSteps: string[], pageHistory: string[]): boolean {
  return completedSteps.length > 0 || pageHistory.length > 1;
}

export function getRedirectPath(
  missing: string[],
  alternativePaths: string[][],
  startPage: string
): string {
  if (missing.length > 0) {
    return TASK_FLOW_MAP[missing[0]]?.path || startPage;
  }

  if (alternativePaths.length > 0) {
    const firstAlternativePath = alternativePaths[0][0];
    return TASK_FLOW_MAP[firstAlternativePath]?.path || startPage;
  }

  return startPage;
}

export function getFlashMessage(hasVisitedMissingPage: boolean): string {
  if (hasVisitedMissingPage) {
    // User visited the page but didn't submit - likely a POST failure/race condition
    return 'Your progress was not saved. Please submit this page to continue.';
  }
  // User is jumping ahead without completing the required step
  return 'You need to complete this page before continuing.';
}
