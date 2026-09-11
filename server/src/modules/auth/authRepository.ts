import databaseClient, {
  type Result,
  type Rows,
} from "../../../database/client";

type NewUser = {
  firstname: string;
  email: string;
  bornAt: string;
  login: string;
  password: string;
  isPegi16: boolean;
};

class AuthRepository {
  async findByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID, firstname, email, login, password, role, avatar, is_pegi16, dark_theme
       FROM user_
       WHERE email = ?`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findByLogin(login: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT ID FROM user_ WHERE login = ?",
      [login],
    );
    return rows[0] ?? null;
  }

  async read(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT ID, firstname, email, login, role, avatar, is_pegi16, dark_theme
       FROM user_
       WHERE ID = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(user: NewUser) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO user_ (firstname, email, born_at, login, password, is_pegi16)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.firstname,
        user.email,
        user.bornAt,
        user.login,
        user.password,
        user.isPegi16,
      ],
    );
    return result.insertId;
  }
}

export default new AuthRepository();
