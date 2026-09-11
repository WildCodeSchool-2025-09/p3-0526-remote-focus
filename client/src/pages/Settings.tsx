import AccountSection from "../components/Settings/AccountSection";
import PreferencesSection from "../components/Settings/PreferencesSection";
import { useAuth } from "../contexts/AuthContext";

function Settings() {
  const { user } = useAuth();

  if (user == null) {
    return null;
  }

  return (
    <div>
      <h1>Paramètres</h1>

      <div className="mt-6">
        <AccountSection
          login={user.login}
          email={user.email}
          avatar={user.avatar}
        />
        <PreferencesSection />
      </div>
    </div>
  );
}

export default Settings;
