import { CameraIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateEmail,
  updateLogin,
  updatePassword,
} from "../../services/accountApi";
import { API_URL } from "../../services/api";
import { UnauthorizedError } from "../../services/errors";
import type { SettingsProfile } from "../../types/Dashboard";

interface AccountSectionProps {
  profile: SettingsProfile;
  onProfileChange: (changes: Partial<SettingsProfile>) => void;
}

function AccountSection({ profile, onProfileChange }: AccountSectionProps) {
  const { updateUser, logout } = useAuth();

  const [isEditingLogin, setIsEditingLogin] = useState(false);
  const [loginValue, setLoginValue] = useState(profile.name);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSavingLogin, setIsSavingLogin] = useState(false);

  async function handleSaveLogin() {
    setLoginError(null);
    setIsSavingLogin(true);

    try {
      const data = await updateLogin(loginValue);
      updateUser({ login: data.login });
      onProfileChange({ name: data.login });
      setIsEditingLogin(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logout();
        return;
      }
      setLoginError(
        error instanceof Error ? error.message : "La modification a échoué.",
      );
    } finally {
      setIsSavingLogin(false);
    }
  }

  function handleCancelLogin() {
    setLoginValue(profile.name);
    setLoginError(null);
    setIsEditingLogin(false);
  }

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(profile.email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  async function handleSaveEmail() {
    setEmailError(null);
    setIsSavingEmail(true);

    try {
      const data = await updateEmail(emailValue);
      updateUser({ email: data.email });
      onProfileChange({ email: data.email });
      setIsEditingEmail(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logout();
        return;
      }
      setEmailError(
        error instanceof Error ? error.message : "La modification a échoué.",
      );
    } finally {
      setIsSavingEmail(false);
    }
  }

  function handleCancelEmail() {
    setEmailValue(profile.email);
    setEmailError(null);
    setIsEditingEmail(false);
  }

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  function resetPasswordFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSavePassword() {
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await updatePassword(currentPassword, newPassword);
      resetPasswordFields();
      setIsEditingPassword(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        logout();
        return;
      }
      setPasswordError(
        error instanceof Error ? error.message : "La modification a échoué.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  function handleCancelPassword() {
    resetPasswordFields();
    setPasswordError(null);
    setIsEditingPassword(false);
  }

  return (
    <>
      <div className="flex gap-4 md:gap-10 items-center my-6">
        <img
          src={`${API_URL}${profile.avatar}`}
          alt={profile.name}
          className="h-16 w-16 shrink-0 rounded-full object-cover md:h-20 md:w-20"
        />
        <button
          type="button"
          className="btn flex justify-center items-center px-6 border-focus-cream bg-focus-void"
          aria-label="Changer la photo"
        >
          <CameraIcon size={18} />
          Changer la photo
        </button>
      </div>
      <div>
        <h3 className="my-6 mt-14">Compte</h3>
        <div>
          <label htmlFor="pseudo" className="text-focus-muted">
            Pseudo
          </label>
          <div className="flex mt-2 mb-6 flex-col items-start gap-4 lg:flex-row">
            <input
              id="pseudo"
              type="text"
              name="pseudo"
              className="input input-bordered bg-focus-surface w-full md:w-2/3"
              value={loginValue}
              disabled={!isEditingLogin || isSavingLogin}
              onChange={(event) => setLoginValue(event.target.value)}
            />
            {isEditingLogin ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                  aria-label="Valider le pseudo"
                  disabled={isSavingLogin}
                  onClick={handleSaveLogin}
                >
                  {isSavingLogin ? "..." : "Valider"}
                </button>
                <button
                  type="button"
                  className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                  aria-label="Annuler la modification du pseudo"
                  disabled={isSavingLogin}
                  onClick={handleCancelLogin}
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                aria-label="Modifier le Pseudo"
                onClick={() => setIsEditingLogin(true)}
              >
                Modifier
              </button>
            )}
          </div>
          {loginError != null && (
            <p className="text-sm text-error" aria-live="polite">
              {loginError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="text-focus-muted">
            Email
          </label>
          <div className="flex mt-2 mb-6 flex-col items-start gap-4 lg:flex-row">
            <input
              id="email"
              type="email"
              name="email"
              className="input input-bordered bg-focus-surface w-full md:w-2/3"
              value={emailValue}
              disabled={!isEditingEmail || isSavingEmail}
              onChange={(event) => setEmailValue(event.target.value)}
            />
            {isEditingEmail ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                  aria-label="Valider l'email"
                  disabled={isSavingEmail}
                  onClick={handleSaveEmail}
                >
                  {isSavingEmail ? "..." : "Valider"}
                </button>
                <button
                  type="button"
                  className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                  aria-label="Annuler la modification de l'email"
                  disabled={isSavingEmail}
                  onClick={handleCancelEmail}
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                aria-label="Modifier le Mail"
                onClick={() => setIsEditingEmail(true)}
              >
                Modifier
              </button>
            )}
          </div>
          {emailError != null && (
            <p className="text-sm text-error" aria-live="polite">
              {emailError}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="text-focus-muted">
            Mot de passe
          </label>
          <div className="border-b border-focus-line/20 pb-6">
            {isEditingPassword ? (
              <div className="flex flex-col gap-4 mt-2">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Mot de passe actuel"
                  aria-label="Mot de passe actuel"
                  className="input input-bordered bg-focus-surface w-full md:w-2/3"
                  value={currentPassword}
                  disabled={isSavingPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Nouveau mot de passe"
                  aria-label="Nouveau mot de passe"
                  className="input input-bordered bg-focus-surface w-full md:w-2/3"
                  value={newPassword}
                  disabled={isSavingPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmer le nouveau mot de passe"
                  aria-label="Confirmer le nouveau mot de passe"
                  className="input input-bordered bg-focus-surface w-full md:w-2/3"
                  value={confirmPassword}
                  disabled={isSavingPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                    aria-label="Valider le mot de passe"
                    disabled={isSavingPassword}
                    onClick={handleSavePassword}
                  >
                    {isSavingPassword ? "..." : "Valider"}
                  </button>
                  <button
                    type="button"
                    className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                    aria-label="Annuler la modification du mot de passe"
                    disabled={isSavingPassword}
                    onClick={handleCancelPassword}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex mt-2 flex-col items-start gap-4 lg:flex-row">
                <input
                  type="text"
                  name="password"
                  aria-label="Mot de passe"
                  className="input input-bordered bg-focus-surface w-full md:w-2/3"
                  value="****"
                  disabled
                />
                <button
                  type="button"
                  className="btn px-6 border-focus-muted-dark/40 bg-focus-void"
                  aria-label="Modifier le Mot de passe"
                  onClick={() => setIsEditingPassword(true)}
                >
                  Modifier
                </button>
              </div>
            )}
            {passwordError != null && (
              <p className="text-sm text-error" aria-live="polite">
                {passwordError}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountSection;
