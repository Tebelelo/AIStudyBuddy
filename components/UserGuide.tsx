import React, { useState, useEffect, useLayoutEffect } from 'react';
import { toast } from 'react-hot-toast';
import { VolumeUpIcon, VolumeOffIcon, DownloadIcon } from './Icons';

// Define the shape of the rectangle for highlighting
interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// Define the shape of a guide step
// FIX: Export the GuideStep interface so it can be used in other files.
export interface GuideStep {
  targetKey?: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'center';
}


// Props for the UserGuide component
interface UserGuideProps {
  onComplete: () => void;
  onDownloadGuide: () => void;
  targets: {
    [key: string]: React.RefObject<HTMLDivElement>;
  };
  guideSteps: GuideStep[];
}

const HIGHLIGHT_PADDING = 8;

export const UserGuide: React.FC<UserGuideProps> = ({ onComplete, targets, guideSteps, onDownloadGuide }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const currentStep = guideSteps[stepIndex];

  // Function to speak the text for the current step
  const speak = (text: string) => {
    try {
      window.speechSynthesis.cancel(); // Stop any previously playing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis failed:", error);
    }
  };
  
  // Effect to update the highlight position and speak when the step or mute state changes
  useLayoutEffect(() => {
    const targetKey = currentStep.targetKey;
    if (targetKey && targets[targetKey]?.current) {
      const targetElement = targets[targetKey].current;
      const rect = targetElement.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightRect(null); // No highlight for steps without a target
    }

    if (!isMuted) {
      speak(currentStep.text);
    } else {
      window.speechSynthesis.cancel();
    }

    // Cleanup speech on component unmount or step change
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [stepIndex, isMuted, targets, currentStep]);
  
  // Handlers for guide navigation
  const handleNext = () => {
    if (stepIndex < guideSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleToggleMute = () => {
    setIsMuted(current => !current);
  };

  // Stop speaking when the component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const getTooltipPosition = () => {
    if (!highlightRect) { // Center for the last step
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    switch (currentStep.position) {
      case 'bottom':
        return { top: `${highlightRect.top + highlightRect.height + HIGHLIGHT_PADDING + 16}px`, left: `${highlightRect.left + highlightRect.width / 2}px`, transform: 'translateX(-50%)'};
      case 'top':
        return { bottom: `${window.innerHeight - highlightRect.top + HIGHLIGHT_PADDING + 16}px`, left: `${highlightRect.left + highlightRect.width / 2}px`, transform: 'translateX(-50%)'};
      case 'left':
        return { top: `${highlightRect.top + highlightRect.height / 2}px`, right: `${window.innerWidth - highlightRect.left + HIGHLIGHT_PADDING + 16}px`, transform: 'translateY(-50%)' };
      default:
         return { top: `${highlightRect.top + highlightRect.height + HIGHLIGHT_PADDING + 16}px`, left: `${highlightRect.left + highlightRect.width / 2}px`, transform: 'translateX(-50%)'};
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50">
      {highlightRect && (
        <div
          className="absolute border-2 border-cyan-400 rounded-lg shadow-2xl transition-all duration-300"
          style={{
            top: `${highlightRect.top - HIGHLIGHT_PADDING}px`,
            left: `${highlightRect.left - HIGHLIGHT_PADDING}px`,
            width: `${highlightRect.width + HIGHLIGHT_PADDING * 2}px`,
            height: `${highlightRect.height + HIGHLIGHT_PADDING * 2}px`,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
          }}
        />
      )}
      <div
        className="absolute bg-slate-800 p-4 rounded-lg shadow-xl max-w-sm w-full transition-all duration-300 animate-fade-in"
        style={getTooltipPosition()}
      >
        <p className="text-slate-200 mb-4">{currentStep.text}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
              aria-label={isMuted ? "Unmute guide" : "Mute guide"}
            >
              {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={onDownloadGuide}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Download user guide"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSkip} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Skip</button>
            <button onClick={handleNext} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
              {stepIndex === guideSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};