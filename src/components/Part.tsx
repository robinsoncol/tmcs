import { useQuery } from "@tanstack/react-query";
import { useContext, useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  fetchPart,
  fetchPartAllowableStatuses,
  InvalidStatusChangeError,
  updatePart,
  type APIPart,
} from "../api";
import { formatStatus, type Status } from "../status";
import ActionError from "./ActionError";
import DebugViewEnabledContext from "./DebugViewEnabledContext";

export default function Part({ id }: { id: string }) {
  const debugging = useContext(DebugViewEnabledContext);

  const partQuery = useQuery({
    queryKey: ["part", id],
    queryFn: () => fetchPart({ id }),
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
      {partQuery.isError ? (
        <ActionError
          error={partQuery.error}
          action={{
            title: "Reload",
            disabled: partQuery.isFetching,
            onClick: () => partQuery.refetch(),
          }}
        />
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
          {partQuery.isPending ? (
            <PartPlaceholder />
          ) : (
            <PartBody
              part={partQuery.data}
              // allowableStatuses={allowableStatusesQuery.data.allowableStatuses}
              // We want to update the partQuery cache so that other Part components
              // with the same part id are rerendered with the updated data
              onChange={partQuery.refetch}
            />
          )}
        </>
      )}
    </div>
  );
}

function PartBody({ part, onChange }: { part: APIPart; onChange: () => void }) {
  const allowableStatusesQuery = useQuery({
    queryKey: ["part-allowable-statuses", part.uuid],
    queryFn: () => fetchPartAllowableStatuses({ id: part.uuid }),
  });

  const form = useForm<{ status: Status }>({
    defaultValues: {
      status: part.status,
    },
  });

  useEffect(() => {
    form.reset({ status: part.status });
  }, [form, part.status]);

  const update = form.handleSubmit(async (values) => {
    try {
      await updatePart({
        id: part.uuid,
        values,
      });
      onChange();
    } catch (e) {
      if (e instanceof InvalidStatusChangeError) {
        // The user might be trying to update status with a stale value. Refresh the
        // list of allowed statuses to make sure that they have the latest values
        allowableStatusesQuery.refetch();
        alert(e.message);
      } else {
        alert("Unexpected Error Occurred");
      }
    }
  });

  if (allowableStatusesQuery.error) {
    return (
      <ActionError
        error={allowableStatusesQuery.error}
        action={{
          title: "Reload",
          disabled: allowableStatusesQuery.isFetching,
          onClick: () => allowableStatusesQuery.refetch(),
        }}
      />
    );
  }

  return (
    <PartForm
      onSubmit={update}
      unit={part.unit}
      version={part.version ?? "N/A"}
      status={
        <>
          <select
            {...form.register("status", { required: true })}
            disabled={!allowableStatusesQuery.isSuccess}
          >
            {allowableStatusesQuery.isSuccess ? (
              allowableStatusesQuery.data.allowableStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))
            ) : (
              <option key="placeholder">Loading...</option>
            )}
          </select>
          {form.formState.isDirty && allowableStatusesQuery.isSuccess && (
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
