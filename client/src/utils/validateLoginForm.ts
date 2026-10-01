import type { LoginFormErrors, LoginFormValues } from "../types/Auth";
import { isValidEmail } from "./isValidEmail";

export function validateLoginForm(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (values.email === "") {
    errors.email = "L'adresse e-mail est obligatoire.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Le format de l'adresse e-mail est invalide.";
  }

  if (values.password === "") {
    errors.password = "Le mot de passe est obligatoire.";
  }

  return errors;
}
