import type { RequestHandler } from "express";

const validateRegister: RequestHandler = (req, res, next) => {
  const { firstName, lastName, email, bornAt, login, password } = req.body;

  if (
    typeof firstName !== "string" ||
    firstName.trim().length === 0 ||
    firstName.trim().length > 100
  ) {
    res.status(400).json({
      error: "Le prénom est obligatoire et limité à 100 caractères.",
    });
    return;
  }

  if (
    lastName != null &&
    (typeof lastName !== "string" || lastName.trim().length > 50)
  ) {
    res.status(400).json({
      error: "Le nom est limité à 50 caractères.",
    });
    return;
  }

  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    email.trim().length > 255
  ) {
    res.status(400).json({
      error: "L'adresse email est obligatoire.",
    });
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    res.status(400).json({
      error: "Le format de l'adresse email est invalide.",
    });
    return;
  }

  if (typeof bornAt !== "string" || bornAt.length === 0) {
    res.status(400).json({
      error: "La date de naissance est obligatoire.",
    });
    return;
  }

  const birthDate = new Date(bornAt);
  const today = new Date();

  if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
    res.status(400).json({
      error: "La date de naissance est invalide.",
    });
    return;
  }

  if (
    typeof login !== "string" ||
    login.trim().length === 0 ||
    login.trim().length > 50
  ) {
    res.status(400).json({
      error: "Le pseudo est obligatoire et limité à 50 caractères.",
    });
    return;
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 255
  ) {
    res.status(400).json({
      error: "Le mot de passe doit contenir au moins 8 caractères.",
    });
    return;
  }

  req.body = {
    firstName: firstName.trim(),
    lastName: lastName?.trim() || null,
    email: email.trim().toLowerCase(),
    bornAt,
    login: login.trim(),
    password,
  };

  next();
};

export default validateRegister;
