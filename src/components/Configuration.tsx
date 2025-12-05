import { useQuery } from "@tanstack/react-query";
import Part from "./Part";
import { fetchChildrenConfigurations, fetchPart } from "../api";
import ActionError from "./ActionError";

export default function Configuration({
  id,
  partId,
  endUnitSerialNo,
}: {
  id: string;
  partId: string;
  endUnitSerialNo: string | null;
}) {
  const parentPartQuery = useQuery({
    queryKey: ["configuration-part", partId],
    queryFn: () => fetchPart({ id: partId }),
  });

  const childrenConfigurationsQuery = useQuery({
    queryKey: ["children-configurations", id],
    queryFn: () => fetchChildrenConfigurations({ id }),
  });

  if (parentPartQuery.isError) {
    return (
      <ActionError
        error={parentPartQuery.error}
        action={{
          title: "Reload",
          onClick: () => parentPartQuery.refetch(),
          disabled: parentPartQuery.isFetching,
        }}
      />
    );
  }

  if (childrenConfigurationsQuery.isError) {
    return (
      <ActionError
        error={childrenConfigurationsQuery.error}
        action={{
          title: "Reload",
          onClick: () => childrenConfigurationsQuery.refetch(),
          disabled: childrenConfigurationsQuery.isFetching,
        }}
      />
    );
  }

  if (parentPartQuery.isPending || childrenConfigurationsQuery.isPending) {
    return <div>Loading</div>;
  }

  return (
    <div>
      <div
        style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, padding: 6 }}
      >
        {parentPartQuery.data.name} - {`Serial No: ${endUnitSerialNo ?? "N/A"}`}
      </div>
      <div
        style={{
          border: "1px solid black",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.25)",
          padding: 12,
          borderRadius: 6,
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {childrenConfigurationsQuery.data.length > 0 ? (
          childrenConfigurationsQuery.data.map(({ partUuid }) => (
            <Part key={partUuid} id={partUuid} />
          ))
        ) : (
          <div>No configurations found</div>
        )}
      </div>
    </div>
  );
}
