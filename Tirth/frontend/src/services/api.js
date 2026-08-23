import { auth } from "../config/firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const firebaseUser =
    auth.currentUser;

  const token = firebaseUser
    ? await firebaseUser.getIdToken()
    : null;

  const isFormData =
    options.body instanceof FormData;

  const headers = {
    ...(!isFormData
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    console.error(
      "Backend connection failed:",
      error
    );

    throw new Error(
      "Unable to connect to the backend service."
    );
  }

  let result = null;

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      result =
        await response.json();
    } else {
      result =
        await response.text();
    }
  } catch {
    result = null;
  }

  if (response.status === 401) {
    throw new Error(
      "Your authentication session is invalid or expired."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  if (!response.ok) {
    throw new Error(
      result?.detail ||
        result?.error?.message ||
        result?.message ||
        `Request failed (${response.status})`
    );
  }

  return result?.data ?? result;
}

export function apiGet(
  endpoint,
  options = {}
) {
  return apiRequest(
    endpoint,
    {
      ...options,
      method: "GET",
    }
  );
}

export function apiPost(
  endpoint,
  body,
  options = {}
) {
  return apiRequest(
    endpoint,
    {
      ...options,

      method: "POST",

      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }
  );
}

export function apiPut(
  endpoint,
  body,
  options = {}
) {
  return apiRequest(
    endpoint,
    {
      ...options,

      method: "PUT",

      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }
  );
}

export function apiPatch(
  endpoint,
  body,
  options = {}
) {
  return apiRequest(
    endpoint,
    {
      ...options,

      method: "PATCH",

      body:
        body instanceof FormData
          ? body
          : JSON.stringify(body),
    }
  );
}

export function apiDelete(
  endpoint,
  options = {}
) {
  return apiRequest(
    endpoint,
    {
      ...options,
      method: "DELETE",
    }
  );
}