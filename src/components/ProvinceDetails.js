import React from 'react';
import ReactDOM from 'react-dom';
import './tooltippopup.css';

const ProvinceDetails = ({ details, onClose, position }) => {
    // Si no hay detalles o la longitud de detalles es 0, no mostrar el componente
    if (!details || details.length === 0) {
        return null;
    }

    // Extracción del nombre de la provincia y el año del primer elemento de los detalles
    const provinceName = details[0].province;
    const year = details[0].year;

    // Orden de los rangos de edad
    const ageRangeOrder = ['0-4 años', '5-14 años', '15-24 años', '25-44 años', '45-64 años', '65-84 años', '85 años y más'];

    // Ordenar los detalles según el rango de edad
    const sortedDetails = details.sort((a, b) => {
        return ageRangeOrder.indexOf(a.ageRange) - ageRangeOrder.indexOf(b.ageRange);
    });

    // Estilos con la posición dinámica basada en el evento de clic
    const panelStyle = {
        position: 'absolute',
        top: `${position.y + 10}px`,  // Usa la posición y del ratón
        left: `${position.x + 10}px`,  // Usa la posición x del ratón
        fontSize: '14px',
        width: '300px',
        background: 'white',
        border: '1px solid black',
        padding: '10px',
        zIndex: 10000,
        overflow: 'auto',
        transform: 'translate(0%, 0%)'  // Centra el panel respecto a las coordenadas del clic
    };

    // Retorna el panel de detalles usando React Portal para posicionarlo en el body
    return ( 
        ReactDOM.createPortal(
            <div className="details-panel" style={panelStyle}>
                {/* Botón para cerrar el panel */}
                <button className="button-modern" onClick={onClose} style={{ float: 'right', marginBottom: '10px' }}>Cerrar</button>
                {/* Título del panel de detalles */}
                <h2>{`Detalles de ${provinceName} (${year})`}</h2>
                {/* Tabla con los detalles de la provincia */}
                <table>
                    <thead>
                        <tr>
                            <th>Rango de Edad</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                            <th style={{ textAlign: 'right' }}>Frecuencia</th>
                            <th style={{ textAlign: 'right' }}>Tasa (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDetails.map((detail, index) => (
                            <tr key={index}>
                                <td>{detail.ageRange}</td>
                                <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('es-ES', { useGrouping: true }).format(detail.total)}</td>
                                <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('es-ES', { useGrouping: true }).format(detail.frequency)}</td>
                                <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(detail.rate)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>,
            document.body
        )
    );
};

export default ProvinceDetails;