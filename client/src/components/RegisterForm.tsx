function RegisterForm() {
  return (
    <form>
      <div>
        <label htmlFor="login">Pseudo</label>
        <input id="login" name="login" type="text" />
      </div>

      <div>
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" />
      </div>

      <div>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" />
      </div>

      <div>
        <label htmlFor="passwordConfirmation">Confirmer le mot de passe</label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
        />
      </div>

      <button type="submit">Créer mon compte</button>
    </form>
  );
}

export default RegisterForm;
