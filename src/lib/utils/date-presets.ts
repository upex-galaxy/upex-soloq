/**
 * Due Date Presets - SQ-28
 *
 * Utilities for invoice due date calculation and validation.
 * Used by DueDatePicker component.
 */

export interface DueDatePreset {
  /** Display label for the preset button */
  label: string;
  /** Number of days from today */
  days: number;
  /** Description for accessibility/tooltips */
  description: string;
}

/**
 * Available due date presets for invoice creation
 * Based on common payment terms
 */
export const DUE_DATE_PRESETS: DueDatePreset[] = [
  { label: 'Hoy', days: 0, description: 'Vence hoy' },
  { label: '15 días', days: 15, description: 'Vence en 15 días' },
  { label: '30 días', days: 30, description: 'Vence en 30 días' },
  { label: '45 días', days: 45, description: 'Vence en 45 días' },
  { label: '60 días', days: 60, description: 'Vence en 60 días' },
];

/**
 * Calculate a due date by adding days to today
 *
 * @param daysFromNow - Number of days to add (can be 0 for today)
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * calculateDueDate(30) // Returns date 30 days from now
 * calculateDueDate(0)  // Returns today's date
 */
export function calculateDueDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date in YYYY-MM-DD format
 *
 * @returns Today's date string
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date string represents a past date
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns true if the date is before today, false otherwise
 *
 * @example
 * isPastDate('2020-01-01') // true
 * isPastDate('2099-12-31') // false
 * isPastDate(getTodayDate()) // false (today is not past)
 */
export function isPastDate(dateString: string): boolean {
  if (!dateString) return false;

  // Parse the date string and compare to today at midnight
  const inputDate = new Date(dateString);
  const today = new Date();

  // Reset times to compare only dates
  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return inputDate < today;
}

/**
 * Find the matching preset for a given date
 *
 * @param dateString - Date in YYYY-MM-DD format
 * @returns The matching preset, or undefined if no match
 */
export function findMatchingPreset(dateString: string): DueDatePreset | undefined {
  if (!dateString) return undefined;

  return DUE_DATE_PRESETS.find(preset => calculateDueDate(preset.days) === dateString);
}
