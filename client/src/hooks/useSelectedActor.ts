import { useState } from "react";

function useSelectedActor() {
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  const handleSelectPerson = (personId: number) => {
    setSelectedPersonId((currentId) =>
      currentId === personId ? null : personId,
    );
  };

  return {
    selectedPersonId,
    handleSelectPerson,
  };
}

export default useSelectedActor;
