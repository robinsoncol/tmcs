import { useQuery } from "@tanstack/react-query";
import Part from "./Part";
import { fetchChildrenConfigurations, fetchPart } from "../api";

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

  if (parentPartQuery.error || childrenConfigurationsQuery.error) {
    return (
      <div>
        Error:{" "}
        {parentPartQuery.error?.message ??
          childrenConfigurationsQuery.error?.message}
      </div>
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
      {childrenConfigurationsQuery.data.length > 0 ? (
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
          {childrenConfigurationsQuery.data.map(({ partUuid }) => (
            <Part key={partUuid} id={partUuid} />
          ))}
        </div>
      ) : (
        <div>No configurations found</div>
      )}
    </div>
  );
}
