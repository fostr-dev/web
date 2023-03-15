import { useCallback, useState } from "react";

export default function useRefresh() {
    const [refreshId, setRefresh] = useState(0);
    return [refreshId, useCallback(() => setRefresh(refreshId + 1), [refreshId])] as const
}