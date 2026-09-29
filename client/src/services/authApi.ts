export interface RegisterPayload {
  firstName: string;
  lastName: string | null;
  email: string;
  bornAt: string;
  login: string;
  password: string;
  genreIds: number[];
}

interface RegisterResponse {
  insertId: number;
}

interface ApiErrorResponse {
  error?: string;
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;

    throw new Error(errorData.error ?? "La création du compte a échoué.");
  }

  return (await response.json()) as RegisterResponse;
}
