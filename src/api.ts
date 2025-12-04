import type { Status } from "./status";

export interface APIConfiguration {
  uuid: string;
  partUuid: string;
  endUnitSerialNo: string | null;
}

export interface APIPart {
  uuid: string;
  name: string;
  version: string | null;
  status: Status;
  unit: string;
}

export interface APIAllowableStatuses {
  partUuid: string;
  currentStatus: Status;
  allowableStatuses: Status[];
}

export function fetchParentConfigurations() {
  return apiFetch<APIConfiguration[]>(`/api/configs/children`);
}

export function fetchChildrenConfigurations({
  id,
}: {
  id: string;
}): Promise<APIConfiguration[]> {
  return apiFetch<APIConfiguration[]>(`/api/configs/children?parentUuid=${id}`);
}

export function fetchPart({ id }: { id: string }): Promise<APIPart> {
  return apiFetch(`/api/parts/${id}`);
}

export function fetchPartAllowableStatuses({ id }: { id: string }) {
  return apiFetch<APIAllowableStatuses>(`/api/parts/${id}/allowable-statuses`);
}

export function updatePart({
  id,
  values,
}: {
  id: string;
  values: Pick<APIPart, "status">;
}) {
  return apiFetch<APIPart>(`/api/parts/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
    headers: {
      "content-type": "application/json",
    },
  });
}

async function apiFetch<T>(...args: Parameters<typeof fetch>): Promise<T> {
  const [url, options = {}] = args;

  const response = await fetch(
    `https://ssuowapy4e.execute-api.us-east-1.amazonaws.com/prod${url}`,
    {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        "x-api-key": localStorage.getItem("x-api-key") ?? "",
      },
    },
  );

  return response.json();
}
