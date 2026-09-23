import { Check, Eye, EyeOff, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import { registerUser } from "../../services/authApi";
import { fetchGenres, type Genre } from "../../services/genreApi";
import type { RegisterFormErrors } from "../../types/Auth";
import { validateRegisterForm } from "../../utils/validateRegisterForm";
import FieldError from "./FieldError";
import GenreSelector from "./GenreSelector";

const inputClassName =
  "mt-1 w-full rounded-md border border-focus-line/50 bg-base-200 md:bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition placeholder:text-base-content/30 focus:border-warning focus:ring-1 focus:ring-warning";

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
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] =
    useState(false);

  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmationValue, setPasswordConfirmationValue] =
    useState("");

  const navigate = useNavigate();

  const isPasswordConfirmationFilled = passwordConfirmationValue.length > 0;

  const isPasswordMatching =
    isPasswordConfirmationFilled && passwordValue === passwordConfirmationValue;

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        setGenres(data);
      })
      .catch((error) => {
        setErrors((currentErrors) => ({
          ...currentErrors,
          genres:
            error instanceof Error
              ? error.message
              : "Impossible de récupérer les genres.",
        }));
      });
  }, []);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((currentValue) => !currentValue);
  };

  const handlePasswordConfirmationVisibility = () => {
    setIsPasswordConfirmationVisible((currentValue) => !currentValue);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordValue(event.target.value);
  };

  const handlePasswordConfirmationChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPasswordConfirmationValue(event.target.value);
  };

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenreIds((currentGenreIds) => {
      if (currentGenreIds.includes(genreId)) {
        return currentGenreIds.filter((id) => id !== genreId);
      }

      return [...currentGenreIds, genreId];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    if (
      firstNameRef.current === null ||
      lastNameRef.current === null ||
      bornAtRef.current === null ||
      loginRef.current === null ||
      emailRef.current === null ||
      passwordRef.current === null ||
      passwordConfirmationRef.current === null
    ) {
      setErrors({
        form: "Impossible de récupérer les champs du formulaire.",
      });
      return;
    }

    const firstName = firstNameRef.current.value.trim();
    const lastName = lastNameRef.current.value.trim();
    const bornAt = bornAtRef.current.value;
    const login = loginRef.current.value.trim();
    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;
    const passwordConfirmation = passwordConfirmationRef.current.value;

    const formValues = {
      firstName,
      lastName,
      bornAt,
      login,
      email,
      password,
      passwordConfirmation,
    };

    const validationErrors = validateRegisterForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Impossible de créer le compte.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
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
          aria-invalid={errors.firstName !== undefined}
          aria-describedby={
            errors.firstName !== undefined ? "firstName-error" : undefined
          }
        />

        <FieldError id="firstName-error" message={errors.firstName} />
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
          aria-invalid={errors.bornAt !== undefined}
          aria-describedby={
            errors.bornAt !== undefined ? "bornAt-error" : undefined
          }
        />

        <FieldError id="bornAt-error" message={errors.bornAt} />
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
          aria-invalid={errors.login !== undefined}
          aria-describedby={
            errors.login !== undefined ? "login-error" : undefined
          }
        />

        <FieldError id="login-error" message={errors.login} />
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
          aria-invalid={errors.email !== undefined}
          aria-describedby={
            errors.email !== undefined ? "email-error" : undefined
          }
        />

        <FieldError id="email-error" message={errors.email} />
      </div>

      <div>
        <label htmlFor="password" className={labelClassName}>
          Mot de passe
        </label>

        <div className="relative">
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            className={`${inputClassName} pr-10`}
            minLength={8}
            maxLength={255}
            autoComplete="new-password"
            required
            onChange={handlePasswordChange}
            aria-invalid={errors.password !== undefined}
            aria-describedby={
              errors.password !== undefined ? "password-error" : undefined
            }
          />

          <button
            type="button"
            onClick={handlePasswordVisibility}
            aria-label={
              isPasswordVisible
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 transition hover:text-base-content"
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <FieldError id="password-error" message={errors.password} />
      </div>

      <div>
        <label htmlFor="passwordConfirmation" className={labelClassName}>
          Confirmer le mot de passe
        </label>

        <div className="relative">
          <input
            ref={passwordConfirmationRef}
            id="passwordConfirmation"
            name="passwordConfirmation"
            type={isPasswordConfirmationVisible ? "text" : "password"}
            className={`${inputClassName} pr-16`}
            minLength={8}
            maxLength={255}
            autoComplete="new-password"
            required
            onChange={handlePasswordConfirmationChange}
            aria-invalid={
              errors.passwordConfirmation !== undefined ||
              (isPasswordConfirmationFilled && !isPasswordMatching)
            }
            aria-describedby={
              errors.passwordConfirmation !== undefined
                ? "passwordConfirmation-error"
                : undefined
            }
          />

          {isPasswordConfirmationFilled && (
            <span
              className="absolute right-10 top-1/2 -translate-y-1/2"
              aria-live="polite"
            >
              {isPasswordMatching ? (
                <>
                  <Check
                    size={18}
                    className="text-success"
                    aria-hidden="true"
                  />

                  <span className="sr-only">
                    Les mots de passe correspondent.
                  </span>
                </>
              ) : (
                <>
                  <X size={18} className="text-error" aria-hidden="true" />

                  <span className="sr-only">
                    Les mots de passe ne correspondent pas.
                  </span>
                </>
              )}
            </span>
          )}

          <button
            type="button"
            onClick={handlePasswordConfirmationVisibility}
            aria-label={
              isPasswordConfirmationVisible
                ? "Masquer la confirmation du mot de passe"
                : "Afficher la confirmation du mot de passe"
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 transition hover:text-base-content"
          >
            {isPasswordConfirmationVisible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <FieldError
          id="passwordConfirmation-error"
          message={errors.passwordConfirmation}
        />
      </div>

      <div>
        <GenreSelector
          genres={genres}
          selectedGenreIds={selectedGenreIds}
          onToggle={handleGenreToggle}
        />

        <FieldError id="genres-error" message={errors.genres} />
      </div>

      {errors.form !== undefined && (
        <p
          role="alert"
          className="rounded-md bg-error/15 px-3 py-2 text-sm text-error"
        >
          {errors.form}
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
