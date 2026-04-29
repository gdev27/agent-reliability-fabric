import { DisplayMode, SessionView, WorkspacePreferences } from "./types";

export const DEFAULT_INDEXER_REFERENCE = "http://localhost:4300";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "demo";
export const DEFAULT_SESSION_VIEW: SessionView = "overview";

export function defaultPreferences(): WorkspacePreferences {
  return {
    displayMode: DEFAULT_DISPLAY_MODE,
    sessionView: DEFAULT_SESSION_VIEW,
    indexerUrlReference: DEFAULT_INDEXER_REFERENCE
  };
}
