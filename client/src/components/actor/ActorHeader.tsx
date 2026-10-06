import { Heart } from "lucide-react";
import { useActorFavoriteActions } from "../../hooks/useActorFavoriteActions";
import type { Actor } from "../../types/media";
import ActionButton from "../ActionButton";
import AuthRequiredModal from "../AuthRequiredModal";
import ActorInfo from "./ActorInfo";

type ActorHeaderProps = {
  actor: Actor;
};

function ActorHeader({ actor }: ActorHeaderProps) {
  const { isFavorite, handleFavorite, isAuthModalOpen, closeAuthModal } =
    useActorFavoriteActions(actor.id);

  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)] gap-4 md:grid-cols-[264px_minmax(0,1fr)] md:gap-8">
      {actor.photo != null ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${actor.photo}`}
          alt={actor.name}
          className="h-48 w-32 rounded-lg object-cover md:h-[396px] md:w-[264px]"
        />
      ) : (
        <div className="h-48 w-32 rounded-lg bg-white/10 md:h-[396px] md:w-[264px]" />
      )}

      <div className="flex min-w-0 flex-col gap-4 md:gap-6">
        <h1 className="text-2xl font-bold md:text-4xl">{actor.name}</h1>

        <ActorInfo actor={actor} />

        <ActionButton
          label="Favoris"
          icon={Heart}
          align="start"
          ariaLabel={
            isFavorite
              ? `Retirer ${actor.name} des favoris`
              : `Ajouter ${actor.name} aux favoris`
          }
          isPressed={isFavorite}
          fillIcon={isFavorite}
          buttonClassName="btn-accent border-focus-coral text-focus-coral hover:!bg-focus-coral hover:!text-focus-cream"
          onClick={handleFavorite}
        />

        <AuthRequiredModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      </div>
    </div>
  );
}

export default ActorHeader;
