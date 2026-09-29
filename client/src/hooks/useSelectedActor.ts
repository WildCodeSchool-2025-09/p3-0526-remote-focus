import { useState } from "react";

function useSelectedActor() {
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId((currentId) =>
      currentId === personId ? null : personId,
    );
  };

  const handleCloseActorWidget = () => {
    setSelectedPersonId(null);
  };

  return {
    selectedPersonId,
    handleSelectPerson,
    handleCloseActorWidget,
  };
}

export default useSelectedActor;
