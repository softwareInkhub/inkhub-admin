import React from "react";

interface ModalNavigatorProps {
  currentIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  nextLabel?: string;
  prevLabel?: string;
}

const ModalNavigator: React.FC<ModalNavigatorProps> = ({
  currentIndex,
  total,
  onNext,
  onPrev,
  nextLabel = "Next",
  prevLabel = "Previous",
}) => (
  <div className="flex justify-end mt-4 gap-2">
    <button
      className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
      onClick={onPrev}
      disabled={currentIndex <= 0}
    >
      {prevLabel}
    </button>
    <button
      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      onClick={onNext}
      disabled={currentIndex >= total - 1}
    >
      {nextLabel}
    </button>
  </div>
);

export default ModalNavigator; 