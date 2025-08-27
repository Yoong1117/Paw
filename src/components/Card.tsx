import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import "../css/card.css";

export type Card = {
  id: number;
  url: string;
  status: "like" | "dislike" | null;
};
type Prop = { onFinished: (finalCards: Card[]) => void };

const SwipeCards = ({ onFinished }: Prop) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [swipedCards, setSwipedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<
    { id: number; emoji: string; x: number; y: number }[]
  >([]);

  const handleSwipe = (dir: "left" | "right", card?: Card) => {
    setCards((pv) => {
      if (!pv.length) return pv;

      // if a card is passed (from drag), use that; else take top card
      const targetCard = card ?? pv[pv.length - 1];
      if (!targetCard) return pv;

      const updated: Card = {
        ...targetCard,
        status: dir === "left" ? "dislike" : "like",
      };

      setSwipedCards((prev) => [...prev, updated]);

      // floating emoji
      const emoji = dir === "left" ? "💔" : "❤️";
      const offset = Math.random() * 250;
      setFloatingEmojis((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), emoji, x: offset, y: 0 },
      ]);

      // remove card from stack
      return pv.filter((c) => c.id !== targetCard.id);
    });
  };

  // Load images
  useEffect(() => {
    if (hasLoaded) return;
    setLoading(true);

    Promise.all(
      Array.from({ length: 20 }, async (_, i) => {
        const res = await fetch(`https://cataas.com/cat?${Math.random()}`);
        const blob = await res.blob();
        return { id: i + 1, url: URL.createObjectURL(blob), status: null };
      })
    ).then((urls) => {
      setCards(urls);
      setLoading(false);
      setHasLoaded(true);
    });
  }, []);

  // Set finish swiped status
  useEffect(() => {
    if (!loading && hasLoaded && cards.length === 0) onFinished(swipedCards);
  }, [cards, loading, hasLoaded, swipedCards, onFinished]);

  // Cleanup all blob urls when component unmounts
  useEffect(() => {
    return () => {
      [...cards, ...swipedCards].forEach((c) => URL.revokeObjectURL(c.url));
    };
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <div style={{ marginTop: "40px" }}>Loading images, please wait ...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {cards.map((card) => (
        <CardComponent
          key={card.id}
          cards={cards}
          setCards={setCards}
          setSwipedCards={setSwipedCards}
          onSwipe={handleSwipe}
          {...card}
        />
      ))}
      {floatingEmojis.map(({ id, emoji, x }) => (
        <motion.div
          key={id}
          initial={{ x, y: 0, opacity: 1, scale: 1 }}
          animate={{ y: -150, opacity: 0, scale: 1.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: "10%",
            top: "10%",
            fontSize: "32px",
            pointerEvents: "none",
          }}
          onAnimationComplete={() =>
            setFloatingEmojis((prev) => prev.filter((e) => e.id !== id))
          }
        >
          {emoji}
        </motion.div>
      ))}
      {cards.length > 0 && (
        <div style={{ display: "flex", gap: "80px", marginTop: "20px" }}>
          <motion.button
            onClick={() => handleSwipe("left")}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              border: "none",
              background: "#f87171",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ position: "relative", top: "5px", fontSize: "20px" }}
            >
              heart_minus
            </span>{" "}
            Dislike
          </motion.button>
          <motion.button
            onClick={() => handleSwipe("right")}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            style={{
              padding: "0px 15px",
              borderRadius: "8px",
              border: "none",
              background: "#34d399",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ position: "relative", top: "5px", fontSize: "20px" }}
            >
              heart_plus
            </span>{" "}
            Like
          </motion.button>
        </div>
      )}
    </div>
  );
};

const CardComponent = ({
  id,
  url,
  onSwipe,
  cards,
}: {
  id: number;
  url: string;
  setCards: Dispatch<SetStateAction<Card[]>>;
  setSwipedCards: Dispatch<SetStateAction<Card[]>>;
  onSwipe: (dir: "left" | "right", card?: Card) => void;
  cards: Card[];
}) => {
  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
  const isFront = id === cards[cards.length - 1].id;
  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  // Drag logic
  const handleDragEnd = () => {
    const threshold = 100;
    const xValue = x.get();
    if (Math.abs(xValue) > threshold) {
      const dir = xValue > 0 ? "right" : "left";
      onSwipe(dir, { id, url, status: null });
    } else {
      x.set(0);
    }
  };

  return (
    <motion.img
      src={url}
      alt="Cat"
      style={{
        gridRow: 1,
        gridColumn: 1,
        position: "relative",
        height: "344px",
        width: "244px",
        borderRadius: "12px",
        objectFit: "cover",
        backgroundColor: "white",
        cursor: "grab",
        originY: "bottom",
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFront
          ? "0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)"
          : undefined,
      }}
      animate={{ scale: isFront ? 1.1 : 0.98 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
    />
  );
};

export default SwipeCards;
