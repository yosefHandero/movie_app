// in services/useFetch.ts
import { useState, useEffect, useCallback } from "react";

function useFetch<T>(fetchFunction: () => Promise<T | undefined>) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [fetchFunction]);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Return refetch function for manual refreshes
    const refetch = useCallback(async () => {
        return fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

export default useFetch;