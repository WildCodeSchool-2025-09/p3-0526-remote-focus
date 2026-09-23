import type { RegisterFormErrors, RegisterFormValues } from "../types/Auth";

export function validateRegisterForm(
  values: RegisterFormValues,
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (values.firstName === "") {
    errors.firstName = "Le prénom est obligatoire.";
  } else if (values.firstName.length > 100) {
    errors.firstName = "Le prénom est limité à 100 caractères.";
  }

  if (values.lastName.length > 50) {
    errors.lastName = "Le nom est limité à 50 caractères.";
  }

  if (values.bornAt === "") {
    errors.bornAt = "La date de naissance est obligatoire.";
  } else {
    const birthDate = new Date(`${values.bornAt}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
      errors.bornAt = "La date de naissance est invalide.";
    }
  }

  if (values.login === "") {
    errors.login = "Le pseudo est obligatoire.";
  } else if (values.login.length > 50) {
    errors.login = "Le pseudo est limité à 50 caractères.";
  }

  if (values.email === "") {
    errors.email = "L'adresse e-mail est obligatoire.";
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(values.email)) {
      errors.email = "Le format de l'adresse e-mail est invalide.";
    } else if (values.email.length > 255) {
      errors.email = "L'adresse e-mail est limitée à 255 caractères.";
    }
  }

  if (values.password === "") {
    errors.password = "Le mot de passe est obligatoire.";
  } else if (values.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  } else if (values.password.length > 255) {
    errors.password = "Le mot de passe est limité à 255 caractères.";
  }

  if (values.passwordConfirmation === "") {
    errors.passwordConfirmation =
      "La confirmation du mot de passe est obligatoire.";
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = "Les mots de passe ne correspondent pas.";
  }

  return errors;
}
