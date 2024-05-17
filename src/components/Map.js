import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import ProvinceDetails from './ProvinceDetails';

const Map = ({ id, year, gender, geoJSON, aggregatedData, mortalityData, modal_bool }) => {
    // Estado para almacenar los detalles de la provincia seleccionada
    const [selectedProvinceDetails, setSelectedProvinceDetails] = useState(null);
    const [activeProvinceCode, setActiveProvinceCode] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // Identificadores únicos para contenedor y SVG
    const containerId = modal_bool === "true" ? `map-container-${id}-modal` : `map-container-${id}`;
    const svgId = modal_bool === "true" ? `map-${gender}-modal` : `map-${gender}`;

    // Identificador único para el tooltip
    let tooltipId
    if (modal_bool === "true") {
        tooltipId =`tooltip-${id}-${gender}-${year}-${modal_bool}`;
    } else {
        tooltipId = `tooltip-${id}-${gender}-${year}`;
    };

    // useEffect para ocultar tooltips al hacer scroll
    useEffect(() => {
        const handleScroll = () => {
            d3.selectAll('.tooltip').style('visibility', 'hidden');
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // useEffect para configurar y actualizar el mapa
    useEffect(() => {
        // Configuración del área del SVG para el mapa
        const isModal = modal_bool === "true";
        const margin = isModal ? {top: 5, right: 5, bottom: 10, left: 5} : {top: 5, right: 5, bottom: 5, left: 5};
        const baseWidth = isModal ? window.innerWidth * 0.5 : 256;
        const baseHeight = isModal ? window.innerHeight * 0.5 : 320;
        const width = baseWidth - margin.left - margin.right;
        const height = baseHeight - margin.top - margin.bottom;

        // Seleccionar el SVG y configurar dimensiones
        const svg = d3.select(`#${isModal ? `map-${gender}-modal` : `map-${gender}`}`);
        svg.attr('width', baseWidth)
           .attr('height', baseHeight)
           .html('')
           .append('g')
           .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Configuración del tooltip
        const tooltip = d3.select('body').selectAll(`#${tooltipId}`).data([null])
            .join('div')
            .attr('id', tooltipId)
            .attr('class', `tooltip tooltip-${gender}`)
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'white')
            .style('border', '1px solid #000')
            .style('padding', '5px');

        // Establecer la proyección geográfica centrada en España
        const projection = d3.geoMercator()
            .scale(1000)
            .center([-3.84922, 40.463667])
            .translate([width / 2, height / 2]);
        
        const path = d3.geoPath().projection(projection);

        // Preparar índice de mortalidad por provincia, año
        const mortalityIndex = {};
        const mortalityDetails = {};

        aggregatedData.forEach(entry => {

            if (entry.year === year.toString()) {
                Object.entries(entry.codes).forEach(([code, data]) => {
                    mortalityIndex[code] = data.avgTasa;
                });
            }
        });
        
        // Preparar detalles de mortalidad por provincia, año y rango de edad
        mortalityData.forEach(d => {
            if (d.Año === year.toString() && d.Sexo === gender) {
                const provinceCode = d.Código.padStart(2, '0');
                if (!mortalityDetails[provinceCode]) {
                    mortalityDetails[provinceCode] = [];
                }
                mortalityDetails[provinceCode].push({
                    province: d['Nombre Provincia'],
                    year: d.Año,
                    ageRange: d['Rango de Edad'],
                    total: d.Total,
                    frequency: d.Frecuencia_Fallecimientos,
                    rate: parseFloat(d.tasa_fallecimiento)
                });
            }
        });

        // Actualiza detalles si la provincia activa sigue siendo la misma y hay datos nuevos
        if (activeProvinceCode) {
            const updatedDetails = mortalityDetails[activeProvinceCode];
        if (updatedDetails && updatedDetails.length > 0) {
            setSelectedProvinceDetails(updatedDetails);
        } else {
            // Solo resetea si realmente no hay datos actualizados
            setSelectedProvinceDetails(null);
            setActiveProvinceCode(null);
        }
    }

        // Asignar tasas de fallecimiento a cada provincia para visualización
        geoJSON.features.forEach(d => {
            if (d.properties.cod_prov === '10'){
            }
            const key = d.properties.cod_prov.padStart(2, '0');
            d.properties.tasa_fallecimiento = mortalityIndex[key] || 0;
            d.properties.Sexo = gender;
        });

        // Configura la escala de colores para representar la tasa de fallecimiento
        const colorScale = d3.scaleLinear()
            .domain([0.505, 0.933, 1.805])  // Puntos de transición: mínimo, mediana, máximo
            .range(["blue", "white", "red"]); 

        // Dibuja las provincias en el mapa
        svg.selectAll(".province")
            .data(geoJSON.features)
            .join("path")
            .attr("class", "province")
            .attr("d", path)
            .attr("transform", function(d) {
                if (d.properties.cod_prov === '35') {
                    return "translate(120,-120)"; // Mueve Las Palmas
                } else if (d.properties.cod_prov === '38') {
                    return "translate(120,-120)"; // Mueve Santa Cruz de Tenerife
                } else if (d.properties.cod_prov === '52') {
                    return "translate(50,-50)"; 
                } else if (d.properties.cod_prov === '51') {
                    return "translate(50,-50)";  // Mueve Ceuta y Melilla
                }
                return ""; // No aplica transformación a otras provincias
            })
            .attr("fill", d => colorScale(d.properties.tasa_fallecimiento))
            .attr("stroke", "black")  // Color del borde
            .attr("stroke-width", 0.2)  // Grosor del borde
            .on('mouseover', function(event, d) {

                const formattedNumber = d.properties.tasa_fallecimiento.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
                const tooltipText = `${d.properties.name}-${d.properties.Sexo}: ${formattedNumber}%`;
                d3.select(`#${tooltipId}`)
                    .html(tooltipText)
                    .style('visibility', 'visible');
            })
            .on('mousemove', function(event) {
                d3.select(`#${tooltipId}`)
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(`#${tooltipId}`)
                    .style('visibility', 'hidden');
            })
            .on('click', function(event, d) {
                const provinceCode = d.properties.cod_prov.padStart(2, '0');
                tooltip.style('visibility', 'hidden'); 
                setMousePosition({ x: event.pageX, y: event.pageY });
                if (activeProvinceCode === provinceCode) {
                    setSelectedProvinceDetails(null);
                    setActiveProvinceCode(null);
                } else {
                    setSelectedProvinceDetails(mortalityDetails[provinceCode] || []);
                    setActiveProvinceCode(provinceCode);
                }
            });

        // Restablecer los detalles activos si el año cambia
        if (activeProvinceCode) {
            const updatedDetails = mortalityDetails[activeProvinceCode];
        if (updatedDetails && updatedDetails.length > 0) {
            setSelectedProvinceDetails(updatedDetails);
        } else {
            // Si no hay datos actualizados, cierra el panel de detalles
            setSelectedProvinceDetails(null);
            setActiveProvinceCode(null);
        }
    }
            
        // Añadiendo el título basado en el género
    svg.append("text")
        .attr("x", width / 2)             
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "40px") 
        .style("font-family", "Georgia, Helvetica, sans-serif") 
        .style("font-weight", "bold")
        .text(`${gender === 'Hombres' ? 'Hombres' : 'Mujeres'}`);


}, [year, gender, geoJSON, aggregatedData, mortalityData, activeProvinceCode, id, tooltipId, modal_bool]);

// Parte del código para mostrar los detalles de la provincia seleccionada
return (
    <>
    <div id={containerId}>
                <svg id={svgId}></svg>
        </div>
        <ProvinceDetails 
            details={selectedProvinceDetails} 
            onClose={() => setSelectedProvinceDetails(null)}
            position={mousePosition}
        />
    </>
);
};

export default Map;
