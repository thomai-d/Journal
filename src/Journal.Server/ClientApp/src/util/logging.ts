export function logError(action: string, error: Error) {
  console.error(`Error while ${action}`, error);
}