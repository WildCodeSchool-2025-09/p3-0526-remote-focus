import type { CastMember } from "../types/media";
import ActorPortraitCard from "./ActorPortraitCard";

type CastListProps = {
    cast: CastMember[];
    castTotal: number;
    selectedPersonId: number | null;
    onSelectPerson: (personId: number) => void;
};

function CastList({
    cast,
    castTotal,
    selectedPersonId,
    onSelectPerson,
}: CastListProps) {
    if (cast.length === 0) {
        return null;
    }

    const remaining = castTotal - cast.length;

    return (
        <section className="relative flex min-w-0 flex-col gap-4">
            <h2 className="text-xl font-bold md:text-2xl">
                Comédiens &amp; personnages
            </h2>

            <div className="flex gap-4 overflow-x-auto pb-2 md:gap-5">
                {cast.map((person) => (
                    <ActorPortraitCard
                        key={person.id}
                        person={person}
                        isSelected={person.id === selectedPersonId}
                        onSelect={onSelectPerson}
                    />
                ))}

                {remaining > 0 && (
                    <div className="flex w-[104px] shrink-0 flex-col items-center gap-2 pt-1 md:w-[140px]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/25 text-sm font-semibold text-[#9FB4BD] md:h-24 md:w-24">
                            +{remaining}
                        </div>
                        <span className="text-center text-sm text-[#9FB4BD]">
                            Voir tout le casting
                        </span>
                    </div>
                )}
            </div>

            <div className="pointer-events-none absolute bottom-0 right-0 top-12 w-16 bg-gradient-to-l from-[#0D1117] to-transparent" />
        </section>
    );
}

export default CastList;