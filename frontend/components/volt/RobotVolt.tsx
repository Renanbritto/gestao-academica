import React, { useState, useEffect } from 'react';

interface RobotVoltProps {
  mood?: 'idle' | 'shy' | 'happy' | 'blink' | 'thinking';
  customMessage?: string;
}

export const RobotVolt: React.FC<RobotVoltProps> = ({
  mood = 'idle',
  customMessage
}) => {
  const [currentMood, setCurrentMood] = useState(mood);
  const [speech, setSpeech] = useState(customMessage || 'Oi! Eu sou o Volt. Eu protejo o seu painel.');

  useEffect(() => {
    setCurrentMood(mood);
    if (customMessage) setSpeech(customMessage);
  }, [mood, customMessage]);

  // Piscar de olhos automático no estado idle
  useEffect(() => {
    if (currentMood !== 'idle') return;

    const interval = setInterval(() => {
      setCurrentMood('blink');
      setTimeout(() => {
        setCurrentMood('idle');
      }, 250);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentMood]);

  return (
    <div className="robot-stage">
      <div className="robot-box" data-mood={currentMood}>
        {/* Balão de fala */}
        <div className="robot-bubble" role="status" aria-live="polite">
          <span>{speech}</span>
        </div>

        {/* Antena */}
        <div className="robot-antenna" aria-hidden="true">
          <span className="antenna-tip" />
          <span className="antenna-rod" />
        </div>

        {/* Cabeça 3D */}
        <div className="robot-head3d" aria-hidden="true">
          <div className="robot-head">
            <span className="ear ear--l" />
            <span className="ear ear--r" />

            {/* Frente com visor */}
            <div className="face face--front">
              <div className="visor">
                <div className="visor-eyes">
                  <span className="eye" />
                  <span className="eye" />
                </div>
                <span className="mouth" />
              </div>
            </div>

            {/* Traseira (modo espiar / senha) */}
            <div className="face face--back">
              <div className="back-meter">
                <i />
                <i />
                <i />
              </div>
              <span className="back-label">SEM ESPIAR 🙈</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
