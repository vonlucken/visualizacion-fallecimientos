import React from 'react';
import './tooltippopup.css';

const TooltipHeatmap = ({ onClose, top, left }) => {
    // Definición de los rangos de valores para los distintos grupos de edad
    const youngRange = ['0,01%', '0,40%'];
    const middleRange = ['0,15%', '1,0%'];
    const middleoldRange = ['1,3%', '5,1%'];
    const oldRange = ['10%', '22%'];

    return (
        // Contenedor principal del tooltip, posicionando con estilos en línea
        <div className="tooltippopup" style={{ top: `${top}px`, left: `${left}px` }}>
            {/* Contenedor del contenido del tooltip */}
            <div className="tooltippopup-content">
                {/* Título del tooltip */}
                <h3 style={{ fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>Valores del Heatmap</h3>
                {/* Lista de los rangos de valores para los distintos grupos de edad */}
                <ul style={{ paddingLeft: "1px" }}>
                    <li style={{ color: '#519CCC', fontSize: '12px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>
                        0-44 años: {youngRange[0]} - {youngRange[1]}
                    </li>
                    <li style={{ color: '#0A7231', fontSize: '12px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>
                        45-64 años: {middleRange[0]} - {middleRange[1]}
                    </li>
                    <li style={{ color: '#E9600F', fontSize: '12px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>
                        65-84 años: {middleoldRange[0]} - {middleoldRange[1]}
                    </li>
                    <li style={{ color: '#D12120', fontSize: '12px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>
                        85 años y más: {oldRange[0]} - {oldRange[1]}
                    </li>
                </ul>
                {/* Botón para cerrar el tooltip */}
                <button className="button-modern" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default TooltipHeatmap;
