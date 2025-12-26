import { CheckCircle2, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface PushUpCounterProps {
  onAddSet: (count: number) => void;
  onUndoLastSet: () => void;
  todayCount: number;
}

const PushUpCounter: React.FC<PushUpCounterProps> = ({
  onAddSet,
  onUndoLastSet,
  todayCount,
}) => {
  const [currentCount, setCurrentCount] = useState<number>(0);

  const presets = [1, 5, 10, 30];

  const handleComplete = () => {
    if (currentCount > 0) {
      onAddSet(currentCount);
      setCurrentCount(0);
      // Native vibration if available
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  return (
    <div className="counter-container">
      <div className="text-center mb-6">
        <span className="counter-status-label">現在のセット</span>
        <div className="counter-count-display">{currentCount}</div>
      </div>

      <div className="counter-presets-grid">
        {presets.map((val) => (
          <button
            key={val}
            onClick={() => setCurrentCount((prev) => prev + val)}
            className="counter-preset-button"
          >
            +{val}
          </button>
        ))}
      </div>

      <div className="counter-button-row">
        <button
          onClick={() => setCurrentCount(0)}
          className="counter-clear-button"
        >
          <Trash2 size={20} /> クリア
        </button>
        <button
          disabled={currentCount === 0}
          onClick={handleComplete}
          className={`counter-complete-button ${
            currentCount > 0
              ? "counter-complete-button--active senkai-gradient"
              : "counter-complete-button--disabled"
          }`}
        >
          <CheckCircle2 size={24} /> セット完了
        </button>
      </div>

      <div className="counter-undo-row">
        <button onClick={onUndoLastSet} className="counter-undo-button">
          前のセットを取り消す
        </button>
      </div>
    </div>
  );
};

export default PushUpCounter;
