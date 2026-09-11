import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { updateLogin } from "../../services/api";
import Modal from "../Modal";

const loginSchema = z.object({
  login: z.string().trim().min(3, "3 caractères minimum").max(50),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type EditLoginModalProps = {
  currentLogin: string;
  onClose: () => void;
};

function EditLoginModal({ currentLogin, onClose }: EditLoginModalProps) {
  const { token, updateUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: currentLogin },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (token == null) {
      return;
    }

    setServerError(null);

    try {
      const user = await updateLogin(values.login, token);
      updateUser(user);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    }
  };

  return (
    <Modal title="Modifier le pseudo">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="form-control">
          <label className="label" htmlFor="login">
            Pseudo
          </label>
          <input
            id="login"
            type="text"
            className="input input-bordered"
            {...register("login")}
          />
          {errors.login && (
            <span className="text-error text-sm">{errors.login.message}</span>
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

export default EditLoginModal;
