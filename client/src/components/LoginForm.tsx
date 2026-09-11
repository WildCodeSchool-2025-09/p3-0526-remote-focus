import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../services/api";

const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const { user, token } = await loginUser(values);
      setAuth(user, token);
      navigate("/");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="form-control">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="input input-bordered"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-error text-sm">{errors.email.message}</span>
        )}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          className="input input-bordered"
          {...register("password")}
        />
        {errors.password && (
          <span className="text-error text-sm">{errors.password.message}</span>
        )}
      </div>

      {serverError != null && (
        <p className="text-error text-sm">{serverError}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>

      <Link to="/register" className="link text-center text-sm">
        Pas encore de compte ? S'inscrire
      </Link>
    </form>
  );
}

export default LoginForm;
