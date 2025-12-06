import { useQuery } from "@tanstack/react-query";
import { fetchParentConfigurations } from "./api";
import Configuration from "./components/Configuration";
import ActionError from "./components/ActionError";
import { DebugViewEnabledProvider } from "./components/DebugViewProvider";

export default function App() {
  const configurationsQuery = useQuery({
    queryKey: ["configurations"],
    queryFn: () => fetchParentConfigurations(),
  });

  return (
    <DebugViewEnabledProvider>
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
    </DebugViewEnabledProvider>
  );
}
