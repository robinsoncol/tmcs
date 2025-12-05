import { useQuery } from "@tanstack/react-query";
import { fetchParentConfigurations } from "./api";
import Configuration from "./components/Configuration";
import DebugViewEnabledContext from "./DebugViewContext";
import { useState } from "react";
import ActionError from "./components/ActionError";

export default function App() {
  const configurationsQuery = useQuery({
    queryKey: ["configurations"],
    queryFn: () => fetchParentConfigurations(),
  });

  const [_debugging, setDebugging] = useState(false);
  const debugging = _debugging && import.meta.env.DEV;

  return (
    <DebugViewEnabledContext.Provider value={debugging}>
      {import.meta.env.DEV && (
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
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 64,
          padding: 64,
        }}
      >
        {configurationsQuery.isPending ? (
          <div>Loading</div>
        ) : configurationsQuery.isError ? (
          <ActionError
            error={configurationsQuery.error}
            action={{
              title: "Reload",
              disabled: configurationsQuery.isFetching,
              onClick: () => configurationsQuery.refetch(),
            }}
          />
        ) : configurationsQuery.data.length > 0 ? (
          configurationsQuery.data.map(
            ({ uuid, partUuid, endUnitSerialNo }) => (
              <Configuration
                key={uuid}
                id={uuid}
                partId={partUuid}
                endUnitSerialNo={endUnitSerialNo}
              />
            ),
          )
        ) : (
          <div>No Parent Configurations found</div>
        )}
      </div>
    </DebugViewEnabledContext.Provider>
  );
}
