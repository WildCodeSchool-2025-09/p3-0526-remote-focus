import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

function BackButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-[#9FB4BD] hover:text-[#F5F5F0]"
    >
      <ArrowLeft size={16} />
      Retour
    </button>
  );
}

export default BackButton;
