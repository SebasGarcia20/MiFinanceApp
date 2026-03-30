/**
 * Centralized error handler for API and runtime errors.
 * Logs for debugging and shows a user-facing toast message.
 */

export interface ReportErrorOptions {
  t: (key: string) => string;
  toast: { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void };
  context?: string;
}

/**
 * Extract user-facing message from API error response.
 * Handles common shapes: { error: string }, { message: string }, Error.
 */
function extractErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.message === 'string') return obj.message;
  }
  return undefined;
}

/**
 * Extract HTTP status from various error shapes.
 * Supports: error.status, error.response.status (axios), error.response?.status.
 */
function extractStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const obj = error as Record<string, unknown>;
  if (typeof obj.status === 'number') return obj.status;
  const response = obj.response;
  if (response && typeof response === 'object') {
    const res = response as Record<string, unknown>;
    if (typeof res.status === 'number') return res.status;
  }
  return undefined;
}

/**
 * Report an error: log to console and show a toast.
 * Maps common HTTP status codes to translation keys.
 * Supports: error.status, error.response.status (axios), error.message, error.error.
 */
export function reportError(
  error: unknown,
  { t, toast, context }: ReportErrorOptions
): void {
  const status = extractStatus(error);
  const extracted = extractErrorMessage(error);
  const prefix = context ? `[${context}] ` : '';
  const statusStr = status != null ? ` status=${status}` : '';

  // Log for debugging
  console.error(prefix + 'Error' + statusStr + ':', error);

  let message: string;

  if (status === 401) {
    message = t('errors.sessionExpired');
  } else if (status === 403) {
    message = t('errors.forbidden');
  } else if (status === 404) {
    message = t('errors.notFound');
  } else if (status != null && status >= 500) {
    message = t('errors.server');
  } else if (extracted && extracted.trim().length > 0) {
    message = extracted.trim();
  } else {
    message = t('errors.generic');
  }

  toast.error(message);
}
