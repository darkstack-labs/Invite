import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface GamesHomeButtonProps {
  className?: string;
}

const GamesHomeButton = ({ className }: GamesHomeButtonProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.75 }}
      className={className}
    >
      <Button
        type="button"
        onClick={() => navigate("/games")}
        className="w-full rounded-full border border-gold/30 bg-black/40 px-6 py-6 text-sm font-semibold tracking-[0.18em] text-gold shadow-[0_0_28px_rgba(212,175,55,0.12)] transition-all hover:bg-gold/12 hover:text-gold"
      >
        ready for games?
        <Gamepad2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default GamesHomeButton;
