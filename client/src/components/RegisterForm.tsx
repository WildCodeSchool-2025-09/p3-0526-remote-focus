import { type FormEvent, useRef, useState } from "react";

function RegisterForm() {
  const loginRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      loginRef.current === null ||
      emailRef.current === null ||
      passwordRef.current === null ||
      passwordConfirmationRef.current === null
    ) {
      setError("Impossible de récupérer les champs du formulaire.");
      return;
    }

    const login = loginRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const passwordConfirmation = passwordConfirmationRef.current.value;

    if (
      login === "" ||
      email === "" ||
      password === "" ||
      passwordConfirmation === ""
    ) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setError(null);

    console.log("Formulaire valide", {
      login,
      email,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="login">Pseudo</label>

        <input
          ref={loginRef}
          id="login"
          name="login"
          type="text"
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

      {error !== null && <p>{error}</p>}

      <button type="submit">Créer mon compte</button>
    </form>
  );
}

export default RegisterForm;
