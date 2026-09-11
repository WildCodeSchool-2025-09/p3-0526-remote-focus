import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { uploadAvatar } from "../../services/api";
import Modal from "../Modal";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type EditAvatarModalProps = {
  onClose: () => void;
};

function EditAvatarModal({ onClose }: EditAvatarModalProps) {
  const { token, updateUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setFile(null);
    setPreviewUrl(null);

    if (selected == null) {
      return;
    }

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Format non supporté (JPG, PNG ou WEBP uniquement)");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse 5 Mo");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (file == null || token == null) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await uploadAvatar(file, token);
      updateUser(user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Changer la photo de profil">
      <div className="flex flex-col gap-4">
        {previewUrl != null && (
          <img
            src={previewUrl}
            alt="Aperçu"
            className="mx-auto h-32 w-32 rounded-full object-cover"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file-input file-input-bordered"
          onChange={handleFileChange}
        />
        <p className="text-focus-muted-dark text-sm">
          JPG, PNG ou WEBP, 5 Mo maximum. L'image sera recadrée si nécessaire.
        </p>

        {error != null && <p className="text-error text-sm">{error}</p>}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={file == null || isSubmitting}
          >
            {isSubmitting ? "Envoi..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default EditAvatarModal;
