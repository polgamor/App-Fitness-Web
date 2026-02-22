export function translateGoal(goal: number | string): string {
  switch (goal) {
    case 1:
    case '1':
      return 'Cut';
    case 2:
    case '2':
      return 'Bulk';
    default:
      return 'Unknown goal';
  }
}
