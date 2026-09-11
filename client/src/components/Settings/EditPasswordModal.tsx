import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { updatePassword } from "../../services/api";
import Modal from "../Modal";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Za-z]/, "Doit contenir au moins une lettre")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

type EditPasswordModalProps = {
  onClose: () => void;
};

function EditPasswordModal({ onClose }: EditPasswordModalProps) {
  const { token } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (values: PasswordFormValues) => {
    if (token == null) {
      return;
    }

    setServerError(null);

    try {
      await updatePassword(values, token);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    }
  };

  return (
    <Modal title="Modifier le mot de passe">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="form-control">
          <label className="label" htmlFor="currentPassword">
            Mot de passe actuel
          </label>
          <input
            id="currentPassword"
            type="password"
            className="input input-bordered"
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <span className="text-error text-sm">
              {errors.currentPassword.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="newPassword">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            className="input input-bordered"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <span className="text-error text-sm">
              {errors.newPassword.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="confirmNewPassword">
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            className="input input-bordered"
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword && (
            <span className="text-error text-sm">
              {errors.confirmNewPassword.message}
            </span>
          )}
        </div>

        {serverError != null && (
          <p className="text-error text-sm">{serverError}</p>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditPasswordModal;
