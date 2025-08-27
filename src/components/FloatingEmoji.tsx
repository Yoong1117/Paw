import { motion } from "framer-motion";

type FloatingEmojiProps = {
  emoji: string;
};

const FloatingEmoji = ({ emoji }: FloatingEmojiProps) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        placeItems: "none",
        top: "50%",
        left: "50%",
        fontSize: "48px",
        pointerEvents: "none",
        zIndex: 100,
      }}
      initial={{ y: 0, opacity: 1, scale: 1 }}
      animate={{ y: -150, opacity: 0, scale: 1.5 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {emoji}
    </motion.div>
  );
};

export default FloatingEmoji;
