import { useState, type ReactNode } from "react";
import DebugViewEnabledContext from "./DebugViewEnabledContext";

const showDebugView = import.meta.env.DEV;

export function DebugViewEnabledProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [_debugging, setDebugging] = useState(false);
  const debugging = _debugging && showDebugView;

  if (!showDebugView) return children;

  return (
    <DebugViewEnabledContext.Provider value={debugging}>
      <>
        <div>
          <label>
            Show debug view:{" "}
            <input
              type="checkbox"
              checked={debugging}
              onChange={() => {
                setDebugging((value) => !value);
              }}
            />
          </label>
        </div>
        {children}
      </>
    </DebugViewEnabledContext.Provider>
  );
}
