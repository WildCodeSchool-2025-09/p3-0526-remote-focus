import { type FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { registerUser } from "../services/authApi";

function RegisterForm() {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const bornAtRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);

    if (
      firstNameRef.current === null ||
      lastNameRef.current === null ||
      bornAtRef.current === null ||
      loginRef.current === null ||
      emailRef.current === null ||
      passwordRef.current === null ||
      passwordConfirmationRef.current === null
    ) {
      setError("Impossible de récupérer les champs du formulaire.");
      return;
    }

    const firstName = firstNameRef.current.value.trim();
    const lastName = lastNameRef.current.value.trim();
    const bornAt = bornAtRef.current.value;
    const login = loginRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const passwordConfirmation = passwordConfirmationRef.current.value;

    if (
      firstName === "" ||
      bornAt === "" ||
      login === "" ||
      email === "" ||
      password === "" ||
      passwordConfirmation === ""
    ) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        firstName,
        lastName: lastName === "" ? null : lastName,
        email,
        bornAt,
        login,
        password,
      });

      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Impossible de créer le compte.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">Prénom</label>

        <input
          ref={firstNameRef}
          id="firstName"
          name="firstName"
          type="text"
          maxLength={100}
          autoComplete="given-name"
          required
        />
      </div>

      <div>
        <label htmlFor="lastName">Nom</label>

        <input
          ref={lastNameRef}
          id="lastName"
          name="lastName"
          type="text"
          maxLength={50}
          autoComplete="family-name"
        />
      </div>

      <div>
        <label htmlFor="bornAt">Date de naissance</label>

        <input
          ref={bornAtRef}
          id="bornAt"
          name="bornAt"
          type="date"
          autoComplete="bday"
          required
        />
      </div>

      <div>
        <label htmlFor="login">Pseudo</label>

        <input
          ref={loginRef}
          id="login"
          name="login"
          type="text"
          maxLength={50}
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label htmlFor="email">Adresse e-mail</label>

        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          maxLength={255}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>

        <input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      <div>
        <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>

        <input
          ref={passwordConfirmationRef}
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>

      {error !== null && <p role="alert">{error}</p>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Création en cours..." : "Créer mon compte"}
      </button>
    </form>
  );
}

export default RegisterForm;
