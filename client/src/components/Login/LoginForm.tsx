import { Eye, EyeOff } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { useAuth } from "../../contexts/AuthContext";
import { loginUser } from "../../services/authApi";
import type { LoginFormErrors } from "../../types/Auth";
import { validateLoginForm } from "../../utils/validateLoginForm";
import FieldError from "../Register/FieldError";

const inputClassName =
  "mt-1 w-full rounded-md border border-focus-line/50 bg-base-200 md:bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition placeholder:text-base-content/30 focus:border-warning focus:ring-1 focus:ring-warning";

const labelClassName = "block text-xs font-medium text-base-content/70";

interface LoginLocationState {
  from?: string;
}

function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as LoginLocationState | null)?.from ?? "/";

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((currentValue) => !currentValue);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    if (emailRef.current === null || passwordRef.current === null) {
      setErrors({
        form: "Impossible de récupérer les champs du formulaire.",
      });
      return;
    }

    const email = emailRef.current.value.trim();
    const password = passwordRef.current.value;

    const validationErrors = validateLoginForm({ email, password });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser({ email, password });

      login(data);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "La connexion a échoué.",
      });

      if (passwordRef.current !== null) {
        passwordRef.current.value = "";
        passwordRef.current.focus();
      }
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
      <h1 className="mb-6 text-2xl font-bold text-base-content">Connexion</h1>

      <div>
        <label htmlFor="email" className={labelClassName}>
          Email
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
            maxLength={255}
            autoComplete="current-password"
            required
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
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </button>

      <p className="text-center text-xs text-base-content/60">
        Pas de compte ?{" "}
        <Link
          to="/register"
          className="font-semibold text-warning hover:underline"
        >
          Inscription
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
