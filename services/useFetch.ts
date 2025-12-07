// in services/useFetch.ts
import { useCallback, useEffect, useRef, useState } from "react";

function useFetch<T>(fetchFunction: () => Promise<T | undefined>) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // Use ref to store the latest fetch function to avoid dependency issues
    const fetchFunctionRef = useRef(fetchFunction);
    const isMountedRef = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    // Update ref when function changes
    useEffect(() => {
        fetchFunctionRef.current = fetchFunction;
    }, [fetchFunction]);

    const fetchData = useCallback(async () => {
        if (!isMountedRef.current) return;
        
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunctionRef.current();
            
            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }
            
            if (isMountedRef.current) {
                setData(result);
            }
        } catch (err: unknown) {
            // Ignore abort errors
            if (err instanceof Error && (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted)) {
                return;
            }
            
            if (isMountedRef.current) {
                const errorMessage = err instanceof Error ? err.message : "Something went wrong";
                setError(errorMessage);
                // Only log non-network errors to avoid console spam
                if (!errorMessage.includes('fetch') && !errorMessage.includes('network')) {
                    console.error("useFetch error:", errorMessage);
                }
            }
        } finally {
            if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    }, []); // Empty deps - we use ref instead

    // Fetch on mount and when function reference changes (which happens when dependencies change)
    useEffect(() => {
        isMountedRef.current = true;
        fetchData();
        
        return () => {
            isMountedRef.current = false;
            // Cancel any pending requests on unmount
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFunction]); // Refetch when function reference changes

    // Return refetch function for manual refreshes
    const refetch = useCallback(async () => {
        return fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

export default useFetch;