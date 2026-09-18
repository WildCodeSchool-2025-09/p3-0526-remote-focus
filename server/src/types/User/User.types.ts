export interface RegisterUserInput {
  firstName: string;
  lastName: string | null;
  email: string;
  bornAt: string;
  login: string;
  password: string;
}
