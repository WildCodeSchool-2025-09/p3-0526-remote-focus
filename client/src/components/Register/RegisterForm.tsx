import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { registerUser } from "../../services/authApi";
import { type Genre, fetchGenres } from "../../services/genreApi";
import GenreSelector from "./GenreSelector";

const inputClassName =
  "mt-1 w-full rounded-md border border-cyan-950 bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition placeholder:text-base-content/30 focus:border-warning focus:ring-1 focus:ring-warning";

const labelClassName = "block text-xs font-medium text-base-content/70";

function RegisterForm() {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const bornAtRef = useRef<HTMLInputElement>(null);
  const loginRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmationRef = useRef<HTMLInputElement>(null);

  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        setGenres(data);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Impossible de récupérer les genres.");
        }
      });
  }, []);

  const toggleGenre = (genreId: number) => {
    setSelectedGenreIds((currentGenreIds) => {
      if (currentGenreIds.includes(genreId)) {
        return currentGenreIds.filter((id) => id !== genreId);
      }

      return [...currentGenreIds, genreId];
    });
  };

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

    if (selectedGenreIds.length === 0) {
      setError("Sélectionnez au moins un genre.");
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
        genreIds: selectedGenreIds,
      });

      navigate("/login", {
        state: {
          accountCreated: true,
        },
      });
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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 md:rounded-2xl md:bg-base-200 md:p-8 md:shadow-xl"
    >
      <h1 className="mb-6 text-2xl font-bold text-base-content">
        Créer un compte
      </h1>

      <div>
        <label htmlFor="firstName" className={labelClassName}>
          Prénom
        </label>

        <input
          ref={firstNameRef}
          id="firstName"
          name="firstName"
          type="text"
          className={inputClassName}
          maxLength={100}
          autoComplete="given-name"
          required
        />
      </div>

      <div>
        <label htmlFor="lastName" className={labelClassName}>
          Nom
        </label>

        <input
          ref={lastNameRef}
          id="lastName"
          name="lastName"
          type="text"
          className={inputClassName}
          maxLength={50}
          autoComplete="family-name"
        />
      </div>

      <div>
        <label htmlFor="bornAt" className={labelClassName}>
          Date de naissance
        </label>

        <input
          ref={bornAtRef}
          id="bornAt"
          name="bornAt"
          type="date"
          className={`${inputClassName} [color-scheme:dark]`}
          autoComplete="bday"
          required
        />
      </div>

      <div>
        <label htmlFor="login" className={labelClassName}>
          Pseudo
        </label>

        <input
          ref={loginRef}
          id="login"
          name="login"
          type="text"
          className={inputClassName}
          maxLength={50}
          autoComplete="username"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>
          Adresse e-mail
        </label>

        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          className={inputClassName}
          maxLength={255}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClassName}>
          Mot de passe
        </label>

        <input
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          className={inputClassName}
          minLength={8}
          maxLength={255}
          autoComplete="new-password"
          required
        />
      </div>

      <div>
        <label htmlFor="passwordConfirmation" className={labelClassName}>
          Confirmer le mot de passe
        </label>

        <input
          ref={passwordConfirmationRef}
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          className={inputClassName}
          minLength={8}
          maxLength={255}
          autoComplete="new-password"
          required
        />
      </div>

      <GenreSelector
        genres={genres}
        selectedGenreIds={selectedGenreIds}
        onToggle={toggleGenre}
      />

      {error !== null && (
        <p
          role="alert"
          className="rounded-md bg-error/15 px-3 py-2 text-sm text-error"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-warning py-2.5 text-sm font-semibold text-warning-content transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Création en cours..." : "Créer mon compte"}
      </button>

      <p className="text-center text-xs text-base-content/60">
        Déjà inscrit ?{" "}
        <Link
          to="/login"
          className="font-semibold text-warning hover:underline"
        >
          Connexion
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
