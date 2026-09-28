import LoginForm from "../components/Login/LoginForm";
import AccountCreatedAlert from "../components/Register/AccountCreatedAlert";

function Login() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-start justify-center bg-base-100 px-5 py-8 md:items-center md:py-12">
      <div className="w-full max-w-sm space-y-4">
        <AccountCreatedAlert />
        <LoginForm />
      </div>
    </div>
  );
}

export default Login;
