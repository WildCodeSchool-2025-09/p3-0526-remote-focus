import { useState } from "react";
import logoFocus from "../../assets/images/logoFocus.png";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";

function HomeHero() {
  const { isAuthenticated, user } = useAuth();
  const login = user?.login ?? "à vous";

  const connectedMessages = [
    "Alors, qu’est-ce qu’on regarde aujourd’hui ?",
    "Votre prochaine obsession se cache peut-être ici.",
    "Un film, une série, un animé… à vous de choisir.",
    "Encore un épisode ? On connaît la réponse.",
    "Installez-vous, votre prochaine découverte vous attend.",
    `Bonjour ${login}, qu’est-ce qu’on regarde aujourd’hui ?`,
    `Salut ${login}, prêt pour une nouvelle découverte ?`,
    `${login}, votre prochain coup de cœur vous attend.`,
    `Encore un épisode, ${login} ? On ne vous juge pas.`,
    `Installez-vous ${login}, on s’occupe des suggestions.`,
    <span key="benjamin">
      Oseras-tu cliquer ?{" "}
      <Link to="/movies/900" className="btn btn-outline btn-sm align-middle">
        Benjamin
      </Link>
    </span>,
  ];

  const [randomIndex] = useState(() =>
    Math.floor(Math.random() * connectedMessages.length),
  );

  const randomMessage = connectedMessages[randomIndex] ?? connectedMessages[0];

  return (
    <section className="mt-6 w-full rounded-box border border-focus-line/20 bg-base-100 px-6 py-4 text-center md:mt-8 md:px-10 md:py-6">
      <img
        src={logoFocus}
        alt="Focus"
        className="mx-auto mb-4 w-24 md:mb-5 md:w-40"
      />

      <h1 className="mx-auto max-w-2xl text-xl font-bold leading-tight md:text-3xl">
        {isAuthenticated
          ? randomMessage
          : "Tout ce que vous regardez, au même endroit."}
      </h1>

      {!isAuthenticated && (
        <p className="mt-4 hidden text-base-content/70 md:block">
          Films, séries et animés : suivez vos sorties, notez ce que vous avez
          vu, gardez la trace de vos comédiens préférés.
        </p>
      )}
    </section>
  );
}

export default HomeHero;
