import type { CaptureConfig } from '../config';

/**
 * Handle GET_CONFIG message
 */
export async function handleGetConfig(deps: CaptureHandlerDependencies): Promise<BackgroundResponse<CaptureConfig>> {
  const config = getConfig();

  console.log('[CaptureHandler] Returning config:', config);

  return {
    success: true,
    data: config,
  };
}
