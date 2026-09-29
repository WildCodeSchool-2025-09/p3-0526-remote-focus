import argon2 from "argon2";

import AbstractSeeder from "./AbstractSeeder";

// Mot de passe commun aux comptes de développement uniquement.
const DEV_PASSWORD = "Focus2026!";

class UserSeeder extends AbstractSeeder {
  constructor() {
    super({ table: "user_", truncate: true });
  }

  async run() {
    const hashedPassword = await argon2.hash(DEV_PASSWORD);

    const users = [
      {
        firstname: "Czagoh",
        email: "czagoh@focus.dev",
        login: "czagoh",
        born_at: "1998-04-12",
        is_pegi16: 1,
        role: "admin" as const,
      },
      {
        firstname: "Sophie",
        email: "sophie@focus.dev",
        login: "sophie",
        born_at: "1999-09-23",
        is_pegi16: 1,
        role: "user" as const,
      },
      {
        firstname: "Kid",
        email: "kid@focus.dev",
        login: "kid",
        born_at: "2012-01-01",
        is_pegi16: 0,
        role: "user" as const,
      },
      {
        firstname: "Tester",
        email: "tester@focus.dev",
        login: "tester",
        born_at: "1995-06-30",
        is_pegi16: 1,
        role: "user" as const,
      },
    ];

    users.forEach((user, index) => {
      const fakeUser = {
        firstname: user.firstname,
        email: user.email,
        born_at: user.born_at,
        login: user.login,
        hashed_password: hashedPassword,
        dark_theme: true,
        is_pegi16: user.is_pegi16,
        role: user.role,
        refName: `user_${index}`,
      };

      this.insert(fakeUser);
    });
  }
}

export default UserSeeder;
