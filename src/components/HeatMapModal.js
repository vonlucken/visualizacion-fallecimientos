// MapModal.js
import React from 'react';
import HeatMap from './HeatMap';
import './styles_modal.css';

const HeatMapModal = ({ year, onClose2013, mortalityData }) => {
    return (
        // Contenedor principal del modal, que cierra el modal al hacer clic en cualquier lugar fuera del contenido
        <div className="modalheat" onClick={onClose2013}>
            {/* Contenedor del contenido del modal, que evita que el clic en el contenido cierre el modal */}
            <div className="modal-contentheat" onClick={e => e.stopPropagation()}>
                {/* Botón para cerrar el modal */}
                <button className="close-button" onClick={onClose2013}>✕</button>
                {/* Contenedor para el HeatMap */}
                <div className="maps-container-2">
                    <HeatMap data={mortalityData} year={year} is_modal={true} />
                </div>
                {/* Contenedor del título */}
                <div className="title-containerheat">
                    <h2>Comportamiento en 1998</h2>
                </div>
            </div>
        </div>
    );
};

export default HeatMapModal;
