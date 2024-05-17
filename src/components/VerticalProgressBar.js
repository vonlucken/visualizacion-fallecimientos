import React from 'react';
import { useSpring, animated } from 'react-spring';
import './VerticalProgressBar.css';

const VerticalProgressBar = ({ id, value, title }) => {
  const minValue = 0.7;
  const maxValue = 1.1;

  // Ajusta el valor para que esté en el rango correcto
  const adjustedValue = ((value - minValue) / (maxValue - minValue)) * 100;

  const barStyle = useSpring({
    height: `${adjustedValue}%`,
    from: { height: '0%' },
    config: { tension: 170, friction: 26 }
  });

  // Calcula el color en función del valor ajustado
  const color = adjustedValue < 60 ? 
                `rgba(0, 0, 255, ${(60 - adjustedValue) / 60})` : 
                `rgba(255, 0, 0, ${(adjustedValue - 60) / 40})`;

  // Función para formatear el valor con coma decimal
  const formatValue = (value) => {
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <animated.div className="progress-bar-fill" style={{ ...barStyle, background: color }}>
          <div className="progress-bar-marker"></div>
        </animated.div>
      </div>
      <div className="progress-bar-title">
        {title}: {formatValue(value)}%
      </div>
    </div>
  );
};

export default VerticalProgressBar;
