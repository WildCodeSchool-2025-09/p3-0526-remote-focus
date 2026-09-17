import logoFocus from "../../assets/images/logoFocus.png";

function HomeHero() {
  return (
    <section className="mt-6 w-full rounded-box border border-focus-line/20 bg-base-100 px-6 py-4 text-center md:mt-8 md:px-10 md:py-6">
      <img
        src={logoFocus}
        alt="Focus"
        className="mx-auto mb-4 w-24 md:mb-5 md:w-40"
      />

      <h1 className="mx-auto max-w-2xl text-xl font-bold leading-tight md:text-3xl">
        Tout ce que vous regardez, au même endroit.
      </h1>

      <p className="mt-4 hidden text-base-content/70 md:block">
        Films, séries et animés : suivez vos sorties, notez ce que vous avez vu,
        gardez la trace de vos comédiens préférés.
      </p>
    </section>
  );
}

export default HomeHero;
