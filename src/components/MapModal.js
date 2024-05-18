// MapModal.js
import React from 'react';
import Map from './Map';
import './styles_modal.css';

const MapModal = ({ year, onClose2008, geoJSONHombres, geoJSONMujeres, aggregatedDataHombres, aggregatedDataMujeres, mortalityDatasaveHombres, mortalityDatasaveMujeres }) => {
    return (
        // Contenedor principal del modal, que cierra el modal al hacer clic en cualquier lugar fuera del contenido
        <div className="modal" onClick={onClose2008}>
            {/* Contenedor del contenido del modal, que evita que el clic en el contenido cierre el modal */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* Botón para cerrar el modal */}
                <button className="close-button" onClick={onClose2008}>✕</button>                
                {/* Contenedor para los mapas */}
                <div className="maps-container-2">
                    {/* Componente Map para hombres en el modal */}
                    <Map 
                        key={'hombres-1998-modal'} 
                        id="hombres-modal" 
                        year={year} 
                        gender="Hombres" 
                        geoJSON={geoJSONHombres} 
                        aggregatedData={aggregatedDataHombres} 
                        mortalityData={mortalityDatasaveHombres} 
                        modal_bool={"true"} 
                    />
                    {/* Componente Map para mujeres en el modal */}
                    <Map 
                        key={'mujeres-1998-modal'} 
                        id="mujeres-modal" 
                        year={year} 
                        gender="Mujeres" 
                        geoJSON={geoJSONMujeres} 
                        aggregatedData={aggregatedDataMujeres} 
                        mortalityData={mortalityDatasaveMujeres} 
                        modal_bool={"true"} 
                    />
                </div>
                {/* Contenedor del título */}
                <div className="title-container">
                    <h2>Mapas en el 1998</h2>
                </div>
                <div>
                <p style={{ fontSize: '24px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif', color: 'white', textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' }}>
                    Vemos como la mortalidad se ha reducido <br />comparando con el 1998. Puedes explorar <br />para comparar los valores.
                </p>

                </div>
            </div>
        </div>
    );
};

export default MapModal;
