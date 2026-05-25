import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns `true` on the client after hydration, `false` during SSR.
 * Uses `useSyncExternalStore` to avoid the cascading-render lint error
 * that arises from calling `setState` synchronously inside `useEffect`.
 */
export function useIsClient(): boolean {
    return useSyncExternalStore(
        emptySubscribe,
        () => true, // client snapshot
        () => false, // server snapshot
    );
}
