import type { ApiLogEntry } from '../types';

// In-memory store for API logs. In a real app, this would be a backend service.
let apiLogs: ApiLogEntry[] = [];

export const getLogs = (): ApiLogEntry[] => {
    // Return a sorted copy
    return [...apiLogs].sort((a, b) => b.startTime - a.startTime);
};

const addLog = (log: Omit<ApiLogEntry, 'id'>) => {
    const newLog: ApiLogEntry = {
        ...log,
        id: `${log.startTime}-${Math.random()}`,
    };
    apiLogs.push(newLog);
};

export const clearLogs = () => {
    // Reassign the array to clear it. This is effective because all functions
    // in this module (getLogs, addLog) reference the `apiLogs` variable in
    // the module's scope.
    apiLogs = [];
}

// Higher-order function to wrap API calls with monitoring logic
export const withMonitoring = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    functionName: ApiLogEntry['functionName']
): T => {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const startTime = Date.now();
        try {
            const result = await fn(...args);
            const endTime = Date.now();
            addLog({
                functionName,
                startTime,
                endTime,
                duration: endTime - startTime,
                status: 'success',
            });
            return result;
        } catch (error) {
            const endTime = Date.now();
             addLog({
                functionName,
                startTime,
                endTime,
                duration: endTime - startTime,
                status: 'error',
                errorMessage: error instanceof Error ? error.message : String(error),
            });
            // Re-throw the error so the calling function can handle it
            throw error;
        }
    }) as T;
};