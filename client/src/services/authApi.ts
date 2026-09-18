export interface RegisterPayload {
  firstName: string;
  lastName: string | null;
  email: string;
  bornAt: string;
  login: string;
  password: string;
}

interface RegisterResponse {
  insertId: number;
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
    throw new Error("La création du compte a échoué.");
  }

  return (await response.json()) as RegisterResponse;
}
