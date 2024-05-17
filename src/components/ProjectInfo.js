import React from 'react';
import './tooltippopup.css';

const TooltipInfo = ({ onClose, top, left }) => {
    return (
        // Contenedor principal del tooltip, posicionando con estilos en línea
        <div className="tooltippopupinfo" style={{ top: `${top}px`, left: `${left}px` }}>
            {/* Contenedor del contenido del tooltip */}
            <div className="tooltippopup-content">
                {/* Título del tooltip */}
                <h3 style={{ fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif' }}>Información del Proyecto</h3>
                {/* Descripción del proyecto */}
                <p>
                    Este proyecto analiza la mortalidad en España desde 1998 hasta 2022, con un enfoque específico en la diferencia por género y edad. Utiliza mapas y heatmaps interactivos para visualizar los datos y resaltar los años significativos, como la pandemia de COVID-19 en 2020, además de mostrar comparativas a 10 y 15 años desde los datos iniciales. El objetivo es proporcionar una herramienta visual e informativa para entender mejor las tendencias y patrones de mortalidad en diferentes regiones y entre diferentes grupos demográficos.
                </p>
                {/* Botón para cerrar el tooltip */}
                <button className="button-modern" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
};

export default TooltipInfo;
