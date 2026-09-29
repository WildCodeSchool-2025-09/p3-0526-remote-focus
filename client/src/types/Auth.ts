export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  bornAt: string;
  login: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  bornAt?: string;
  login?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  genres?: string;
  form?: string;
}
