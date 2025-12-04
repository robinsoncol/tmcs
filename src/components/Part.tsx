import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  fetchPart,
  fetchPartAllowableStatuses,
  updatePart,
  type APIAllowableStatuses,
  type APIPart,
} from "../api";
import DebugViewEnabledContext from "../DebugViewContext";
import { formatStatus, type Status } from "../status";

export default function Part({ id }: { id: string }) {
  const debugging = useContext(DebugViewEnabledContext);

  const partQuery = useQuery({
    queryKey: ["part", id],
    queryFn: () => fetchPart({ id }),
  });

  const allowableStatusesQuery = useQuery({
    queryKey: ["allowable-statuses", id],
    queryFn: () => fetchPartAllowableStatuses({ id }),
  });

  return (
    <div
      style={{
        border: "1px dotted black",
        padding: 6,
        minWidth: 180,
        borderRadius: 4,
      }}
    >
      {partQuery.isError || allowableStatusesQuery.isError ? (
        <div>
          Error:{" "}
          {partQuery.error?.message ?? allowableStatusesQuery.error?.message}
        </div>
      ) : (
        <>
          <div
            style={{
              fontWeight: "bold",
              color: "rgb(70, 70, 70)",
              marginBottom: 4,
            }}
          >
            {partQuery.isPending ? "..." : partQuery.data.name}
          </div>
          {debugging && <div>UUID: {id}</div>}
          {partQuery.isPending || allowableStatusesQuery.isPending ? (
            <PartPlaceholder />
          ) : (
            <PartBody
              part={partQuery.data}
              allowableStatuses={allowableStatusesQuery.data}
              onChange={allowableStatusesQuery.refetch}
            />
          )}
        </>
      )}
    </div>
  );
}

function PartBody({
  part,
  allowableStatuses: { currentStatus, allowableStatuses },
  onChange,
}: {
  part: APIPart;
  allowableStatuses: APIAllowableStatuses;
  onChange: () => void;
}) {
  const form = useForm<{ status: Status }>({
    defaultValues: {
      status: currentStatus,
    },
  });

  useEffect(() => {
    form.reset({ status: currentStatus });
  }, [form, currentStatus]);

  return (
    <PartForm
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await updatePart({ id: part.uuid, values });
          onChange();
        } catch (e) {
          alert(e instanceof Error ? e.message : "Unexpected error occurred");
        }
      })}
      unit={part.unit}
      version={part.version ?? "N/A"}
      status={
        <>
          <select {...form.register("status", { required: true })}>
            {allowableStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          {form.formState.isDirty && (
            <button type="submit" disabled={form.formState.isSubmitting}>
              Submit
            </button>
          )}
        </>
      }
    />
  );
}

function PartPlaceholder() {
  return <PartForm unit="..." version="..." status="..." />;
}

function PartForm({
  unit,
  version,
  status,
  onSubmit,
}: {
  unit: ReactNode;
  version: ReactNode;
  status: ReactNode;
  onSubmit?: React.DOMAttributes<HTMLFormElement>["onSubmit"];
}) {
  return (
    <form onSubmit={onSubmit}>
      <label style={{ display: "block" }}>Unit: {unit}</label>
      <label style={{ display: "block" }}>Version: {version}</label>
      <label style={{ display: "block" }}>Status: {status}</label>
    </form>
  );
}
