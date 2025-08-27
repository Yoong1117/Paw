import { motion } from "framer-motion";
import { type Card } from "./Card";
import "../css/result.css";

type Props = {
  results: Card[];
  onRetry: () => void;
};

export default function Result({ results, onRetry }: Props) {
  return (
    <div className="result-container">
      <div>
        <h3>You Liked:</h3>
        <div className="result-grid">
          {results
            .filter((c) => c.status === "like")
            .map((c) => (
              <img
                key={c.id}
                src={c.url}
                className="result-image"
                alt="Liked cat"
              />
            ))}
        </div>

        <h3>You Disliked:</h3>
        <div className="result-grid">
          {results
            .filter((c) => c.status === "dislike")
            .map((c) => (
              <img
                key={c.id}
                src={c.url}
                className="result-image"
                alt="Disliked cat"
              />
            ))}
        </div>
      </div>

      <motion.button
        className="retry-button"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={onRetry}
      >
        Retry
      </motion.button>
    </div>
  );
}
