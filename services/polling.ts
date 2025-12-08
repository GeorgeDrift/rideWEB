/**
 * Polling Service - Manages automatic data refreshing across dashboards
 * Handles intervals and cleanup for rider, driver, and admin dashboards
 */

interface PollingConfig {
    interval: number; // milliseconds between polls
    onPoll: () => Promise<void>;
}

class PollingService {
    private intervals: Map<string, NodeJS.Timeout> = new Map();
    private static instance: PollingService;

    private constructor() { }

    public static getInstance(): PollingService {
        if (!PollingService.instance) {
            PollingService.instance = new PollingService();
        }
        return PollingService.instance;
    }

    /**
     * Start polling for a specific dashboard/feature
     * @param key Unique identifier for this polling session
     * @param config Polling configuration with interval and callback
     */
    public startPolling(key: string, config: PollingConfig) {
        // Clear any existing interval with this key
        this.stopPolling(key);

        // Start the polling interval
        const interval = setInterval(async () => {
            try {
                await config.onPoll();
            } catch (error) {
                console.error(`Polling error for ${key}:`, error);
            }
        }, config.interval);

        this.intervals.set(key, interval);
        console.log(`✓ Polling started: ${key} (interval: ${config.interval}ms)`);
    }

    /**
     * Stop polling for a specific key
     * @param key Unique identifier for the polling session to stop
     */
    public stopPolling(key: string) {
        const interval = this.intervals.get(key);
        if (interval) {
            clearInterval(interval);
            this.intervals.delete(key);
            console.log(`✓ Polling stopped: ${key}`);
        }
    }

    /**
     * Stop all active polling intervals
     */
    public stopAllPolling() {
        this.intervals.forEach((interval) => clearInterval(interval));
        this.intervals.clear();
        console.log('✓ All polling stopped');
    }

    /**
     * Get list of active polling keys
     */
    public getActivePolling(): string[] {
        return Array.from(this.intervals.keys());
    }

    /**
     * Check if a specific polling is active
     */
    public isPolling(key: string): boolean {
        return this.intervals.has(key);
    }
}

export const pollingService = PollingService.getInstance();
