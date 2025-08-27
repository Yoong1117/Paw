import { useState } from "react";
import SwipeCards from "./components/Card";
import { type Card } from "./components/Card";
import Result from "./components/Result";

export default function App() {
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<Card[]>([]);

  return (
    <>
      <div
        style={{
          margin: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <img
          src="/paw.png"
          alt="Paw icon"
          style={{ width: "32px", height: "32px" }}
        />
        Paw and Preferences
      </div>

      {!showResult ? (
        <SwipeCards
          onFinished={(finalCards) => {
            setResults(finalCards);
            setShowResult(true);
          }}
        />
      ) : (
        <Result results={results} onRetry={() => setShowResult(false)} />
      )}
    </>
  );
}
