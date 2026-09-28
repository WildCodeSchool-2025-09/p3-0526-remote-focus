import type { LoginFormErrors, LoginFormValues } from "../types/Auth";

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (values.email === "") {
    errors.email = "L'adresse e-mail est obligatoire.";
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(values.email)) {
      errors.email = "Le format de l'adresse e-mail est invalide.";
    }
  }

  if (values.password === "") {
    errors.password = "Le mot de passe est obligatoire.";
  }

  return errors;
}
