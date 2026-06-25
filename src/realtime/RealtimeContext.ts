import { createContext } from "react";
import type { RealtimeContextValue } from "./types";

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);
