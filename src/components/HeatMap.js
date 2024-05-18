import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Configuración de márgenes y dimensiones del gráfico
const margin = { top: 0, right: 2, bottom: 50, left: 180 };
const width = 1400 - margin.left - margin.right;
const height = 155 - margin.top - margin.bottom;

const HeatMap = ({ data, year, ismodal }) => {
    // Referencias para los SVGs y el tooltip
    const svgRefHombres = useRef(null);
    const svgRefMujeres = useRef(null);
    const tooltipRef = useRef(null);

    // useEffect para inicializar y actualizar el gráfico de heatmap
    useEffect(() => {
        // Crear el tooltip si no existe
        if (!tooltipRef.current) {
            tooltipRef.current = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("visibility", "hidden")
                .style("position", "absolute")
                .style("background", "#fff")
                .style("border", "solid 1px #aaa")
                .style("border-radius", "5px")
                .style("padding", "10px");
        }

        // Verificar si los datos y el año están disponibles
        if (!data || data.length === 0 || !year) {
            console.log("Datos no disponibles o año no establecido.");
            return;
        }
        // Seleccionar los SVGs y limpiar el contenido anterior
        const svgHombres = d3.select(svgRefHombres.current);
        const svgMujeres = d3.select(svgRefMujeres.current);
        svgHombres.selectAll("*").remove();
        svgMujeres.selectAll("*").remove();

        // Filtrar los datos para el año seleccionado
        const yearStr = year.toString();
        const filteredData = data.filter(d => d.Año === yearStr);

        // Transformar los datos para el gráfico
        const rates = filteredData.map(d => ({
            provincia: d["Nombre Provincia"],
            group: `${d.Sexo} ${d["Rango de Edad"]}`,
            rate: d["tasa_fallecimiento"]
        }));

        // Verificar si hay datos para el año seleccionado
        if (filteredData.length === 0) {
            console.log(`No hay datos para el año ${year}.`);
            return;
        }

        // Orden de los rangos de edad y sexos
        const ageOrder = ["0-4 años", "5-14 años", "15-24 años", "25-44 años", "45-64 años", "65-84 años", "85 años y más"];
        const sexOrder = ["Hombres", "Mujeres"];

        // Índices para ordenar los grupos
        const sexIndex = sexOrder.reduce((acc, sex, i) => ({ ...acc, [sex]: i }), {});
        const ageIndex = ageOrder.reduce((acc, age, i) => ({ ...acc, [age]: i }), {});

        // Función para comparar grupos por sexo y rango de edad
        const compareGroups = (a, b) => {
            const splitA = a.split(" ");
            const splitB = b.split(" ");
            const sexA = splitA[0];
            const sexB = splitB[0];
            const ageA = splitA.slice(1).join(" ");
            const ageB = splitB.slice(1).join(" ");
            if (sexA === sexB) {
                return ageIndex[ageA] - ageIndex[ageB];
            }
            return sexIndex[sexA] - sexIndex[sexB];
        };
        
        // Grupos ordenados
        const sortedGroups = [...new Set(rates.map(d => d.group))].sort(compareGroups);

        // Escalas para los ejes X e Y
        const xScale = d3.scaleBand()
            .domain([...new Set(rates.map(d => d.provincia))]) // Provincias en el eje X
            .range([0, width])
            .padding(0.2);

        const yScaleHombres = d3.scaleBand()
            .domain(sortedGroups.filter(group => group.startsWith("Hombres"))) // Categorías en el eje Y
            .range([0, height])
            .padding(0.01);

        const yScaleMujeres = d3.scaleBand()
            .domain(sortedGroups.filter(group => group.startsWith("Mujeres"))) // Categorías en el eje Y
            .range([0, height])
            .padding(0.01);


        // Función para calcular mínimos y máximos de tasas de fallecimiento
        const calculateMinMax = (ageRanges) => {
            let filteredRates;
            if (ageRanges === "85 años") {
                // Excluir específicamente todos los rangos excepto "85 años y más"
                const excludedRanges = ["0-4 años", "5-14 años", "15-24 años", "25-44 años", "45-64 años", "65-84 años"];
                filteredRates = data.filter(d => !excludedRanges.includes(d["Rango de Edad"]) && d["Rango de Edad"] === "85 años y más");
                
            } else {
                // Filtrar incluyendo solo los rangos especificados
                filteredRates = data.filter(d => ageRanges.includes(d["Rango de Edad"]));
                
            }
            const minRate = d3.min(filteredRates, d => d["tasa_fallecimiento"]);
            const maxRate = d3.max(filteredRates, d => d["tasa_fallecimiento"]);
            return [minRate, maxRate];
        };

        // Calcular los valores mínimo y máximo para diferentes grupos de edad
        const [youngMin, youngMax] = calculateMinMax(["0-4 años", "5-14 años", "15-24 años", "25-44 años"]);
        const [middleMin, middleMax] = calculateMinMax(["45-64 años"]);
        const [middleoldMin, middleoldMax] = calculateMinMax(["65-84 años"]);
        const [oldMin, oldMax] = [10, 25]; // Valores estáticos para el grupo de 85 años y más

        // Función para obtener la escala de color basada en el rango de edad
        const getColorScale = (ageRange) => {
            if (["0-4 años", "5-14 años", "15-24 años", "25-44 años"].includes(ageRange)) {
                return d3.scaleSequential(d3.interpolateBlues).domain([youngMin, youngMax]);
            } else if (["45-64 años"].includes(ageRange)) {
                return d3.scaleSequential(d3.interpolateGreens).domain([middleMin, middleMax]);
            } else if (["65-84 años"].includes(ageRange)) {
                return d3.scaleSequential(d3.interpolateOranges).domain([middleoldMin, middleoldMax]);
            } else {
                return d3.scaleSequential(d3.interpolateReds).domain([oldMin, oldMax]);
            }
        };

        // Función para dibujar el heatmap
        const drawHeatmap = (svg, yScale, sex, showXLabels, offsetY = 0) => {
            svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top + offsetY})`)
                .selectAll("rect")
                .data(rates.filter(d => d.group.startsWith(sex)))
                .join("rect")
                .attr("x", d => xScale(d.provincia))
                .attr("y", d => yScale(d.group))
                .attr("width", xScale.bandwidth() * 2)
                .attr("height", yScale.bandwidth())
                .attr("fill", d => {
                    const ageRange = d.group.split(" ").slice(1).join(" ");
                    const colorScale = getColorScale(ageRange);
                    return colorScale(d.rate);
                })
                .attr("stroke", "black")
                .on("mouseover", (event, d) => {
                    tooltipRef.current.style("visibility", "visible").html(`Provincia: ${d.provincia}<br>Grupo: ${d.group.split(" ").slice(1).join(" ")}<br>Tasa de Fallecimiento: ${parseFloat(d.rate).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}%`);
                })
                .on("mousemove", (event) => {
                    tooltipRef.current.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY - 20}px`);
                })
                .on("mouseout", () => {
                    tooltipRef.current.style("visibility", "hidden");
                });
        
            if (showXLabels) {
                // Eje X para provincias
                svg.append("g")
                    .attr("transform", `translate(${margin.left},${margin.top + height + offsetY})`)
                    .call(d3.axisBottom(xScale))
                    .selectAll("text")
                    .attr("transform", "translate(-8,0)rotate(-25)")
                    .style("text-anchor", "end")
                    .style("font-size", "13px")
                    .style("fill", ismodal ? 'white' : null);

            }
        
            // Eje Y para categorías
            svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top + offsetY})`)
                .call(d3.axisLeft(yScale)
                    .tickFormat(group => group.split(" ").slice(1).join(" ")))
                .selectAll("text")
                .style("font-size", "13px")
                .style("fill", ismodal ? 'white' : null);
        };
        
        // Dibuja el heatmap de Hombres sin etiquetas en el eje X
        drawHeatmap(svgHombres, yScaleHombres, "Hombres", false);
        
        // Agrega el texto "Hombres" rotado al lado del heatmap de Hombres
        svgHombres.append("text")
            .attr("x", -height / 2)
            .attr("y", margin.left - 100)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", ismodal ? 'white' : null)
            .text("Hombres");
        
        // Dibuja el heatmap de Mujeres con etiquetas en el eje X y un offsetY para subirlo
        const offsetY = -0;
        drawHeatmap(svgMujeres, yScaleMujeres, "Mujeres", true, offsetY);
        
        // Agrega el texto "Mujeres" rotado al lado del heatmap de Mujeres
        svgMujeres.append("text")
            .attr("x", -height / 2)
            .attr("y", margin.left - 100)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill", ismodal ? 'white' : null)
            .text("Mujeres");

    }, [data, year, ismodal]);

    // useEffect para manejar el tooltip al hacer scroll
    useEffect(() => {
        const handleScroll = () => {
            if (tooltipRef.current) {
                tooltipRef.current.style("visibility", "hidden");
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div style={{ display: 'block' }}>
            <div style={{ marginBottom: '0px' }}>
                <svg ref={svgRefHombres} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
            </div>
            <div style={{ marginTop: '-40px' }}>
                <svg ref={svgRefMujeres} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
            </div>
        </div>
    );
    
};

export default HeatMap;
