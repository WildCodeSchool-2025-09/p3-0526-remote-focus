import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import { updateEmail } from "../../services/api";
import Modal from "../Modal";

const emailSchema = z.object({
  email: z.string().trim().email("Email invalide"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

type EditEmailModalProps = {
  currentEmail: string;
  onClose: () => void;
};

function EditEmailModal({ currentEmail, onClose }: EditEmailModalProps) {
  const { token, updateUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: currentEmail },
  });

  const onSubmit = async (values: EmailFormValues) => {
    if (token == null) {
      return;
    }

    setServerError(null);

    try {
      const user = await updateEmail(values.email, token);
      updateUser(user);
      onClose();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Une erreur est survenue",
      );
    }
  };

  return (
    <Modal title="Modifier l'email">
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

export default EditEmailModal;
