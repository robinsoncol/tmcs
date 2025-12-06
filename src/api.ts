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
  }).catch((e: unknown) => {
    if (e instanceof Error && e.message.includes("invalid_value")) {
      // This is a weird way to read the error message. Might be a bug on the backend
      const data = JSON.parse(e.message)[0];
      throw new InvalidStatusChangeError(data.message, data.values);
    }

    throw e;
  });
}

export class InvalidStatusChangeError extends Error {
  allowableStatuses: Status[];

  constructor(message: string, allowableStatuses: Status[]) {
    super(message);
    this.allowableStatuses = allowableStatuses;
  }
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

  // Note: This isn't a robust solution. A library like axios might handle this better
  if (!response.ok) {
    if (response.headers.get("Content-Type")?.includes("application/json")) {
      const data = await response.json();

      if (data.error && data.error.name && data.error.message) {
        const error = new Error();
        error.name = data.error.name;
        error.message = data.error.message;
        throw error;
      }

      throw data;
    }

    throw new Error("Something went wrong");
  }

  return response.json();
}
