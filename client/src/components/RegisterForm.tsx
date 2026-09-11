import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { registerUser } from "../services/api";

const registerSchema = z
  .object({
    firstname: z.string().trim().min(1, "Le prénom est requis"),
    login: z.string().trim().min(3, "3 caractères minimum"),
    email: z.string().trim().email("Email invalide"),
    bornAt: z.string().min(1, "La date de naissance est requise"),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Za-z]/, "Doit contenir au moins une lettre")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const { user, token } = await registerUser(values);
      setAuth(user, token);
      navigate("/preferences");
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
        <label className="label" htmlFor="firstname">
          Prénom
        </label>
        <input
          id="firstname"
          className="input input-bordered"
          {...register("firstname")}
        />
        {errors.firstname && (
          <span className="text-error text-sm">{errors.firstname.message}</span>
        )}
      </div>

      <div className="form-control">
        <label className="label" htmlFor="login">
          Pseudo
        </label>
        <input
          id="login"
          className="input input-bordered"
          {...register("login")}
        />
        {errors.login && (
          <span className="text-error text-sm">{errors.login.message}</span>
        )}
      </div>

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
        <label className="label" htmlFor="bornAt">
          Date de naissance
        </label>
        <input
          id="bornAt"
          type="date"
          className="input input-bordered"
          {...register("bornAt")}
        />
        {errors.bornAt && (
          <span className="text-error text-sm">{errors.bornAt.message}</span>
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

      <div className="form-control">
        <label className="label" htmlFor="confirmPassword">
          Confirmation du mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          className="input input-bordered"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <span className="text-error text-sm">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {serverError != null && (
        <p className="text-error text-sm">{serverError}</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </button>

      <Link to="/login" className="link text-center text-sm">
        Déjà inscrit ? Se connecter
      </Link>
    </form>
  );
}

export default RegisterForm;
