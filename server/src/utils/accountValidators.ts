const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginValue(login: unknown): string | null {
  if (
    typeof login !== "string" ||
    login.trim().length === 0 ||
    login.trim().length > 50
  ) {
    return "Le pseudo est obligatoire et limité à 50 caractères.";
  }

  return null;
}

export function validateEmailValue(email: unknown): string | null {
  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    email.trim().length > 255
  ) {
    return "L'adresse e-mail est obligatoire.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Le format de l'adresse e-mail est invalide.";
  }

  return null;
}

export function validatePasswordValue(password: unknown): string | null {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 255
  ) {
    return "Le mot de passe doit contenir entre 8 et 255 caractères.";
  }

  return null;
}
