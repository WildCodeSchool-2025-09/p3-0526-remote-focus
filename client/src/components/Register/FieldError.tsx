interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (message === undefined) {
    return null;
  }

  return (
    <p id={id} className="mt-1 text-xs text-error">
      {message}
    </p>
  );
}

export default FieldError;
