import React from 'react';
import './tooltippopup.css';

const TooltipMap = ({ onClose, top, left }) => {
    return (
        // Contenedor principal del tooltip, con posición dinámica basada en los valores de top y left
        <div className="tooltippopupmap" style={{ top: `${top}px`, left: `${left}px` }}>
            {/* Contenedor del contenido del tooltip */}
            <div className="tooltippopupinfo-content">
                {/* Título del tooltip */}
                <h3 style={{ fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>Leyenda del Mapa</h3>
                {/* Contenedor para la barra de gradiente */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ flexGrow: 1, height: '20px', background: 'linear-gradient(to right, blue, white, red)' }}></div>
                </div>
                {/* Valores de la leyenda alineados debajo de la barra de gradiente */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontSize: '11px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>0,505%</span>
                    <span style={{ fontSize: '11px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>0,933%</span>
                    <span style={{ fontSize: '11px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>1,805%</span>
                </div>
                {/* Botón para cerrar el tooltip */}
                <button className="button-modern" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default TooltipMap;
