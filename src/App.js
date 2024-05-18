import React, { useState, useEffect, useCallback  } from 'react';
import Map from './components/Map';
import './App.css';

import HeatMap from './components/HeatMap';
import VerticalProgressBar from './components/VerticalProgressBar';
import * as d3 from 'd3';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MapModal from './components/MapModal';
import HeatMapModal from './components/HeatMapModal';
import TooltipMap from './components/TooltipMap';
import TooltipHeatmap from './components/TooltipHeatmap';
import TooltipInfo from './components/ProjectInfo';

gsap.registerPlugin(ScrollTrigger);

const App = () => {
    // Estados para gestionar la carga y manejo de datos
    const [isLoading, setIsLoading] = useState(true);
    const [year, setYear] = useState(1998);
    const [geoJSONHombres, setGeoJSONHombres] = useState(null);
    const [geoJSONMujeres, setGeoJSONMujeres] = useState(null);
    const [geoJSONModalHombres, setGeoJSONModalHombres] = useState(null);
    const [geoJSONModalMujeres, setGeoJSONModalMujeres] = useState(null);
    const [aggregatedDataHombres, setAggregatedDataHombres] = useState(null);
    const [aggregatedDataMujeres, setAggregatedDataMujeres] = useState(null);
    const [mortalityDatasaveHombres, setMortalityDataSaveHombres] = useState(null);
    const [mortalityDatasaveMujeres, setMortalityDataSaveMujeres] = useState(null);
    const [mortalityData, setMortalityData] = useState([]);
    const [isCovidYearActive, setIsCovidYearActive] = useState(false);
    const [isModalVisible2008, setIsModalVisible2008] = useState(false);
    const [isModalVisible2013, setIsModalVisible2013] = useState(false);
    const [modalClosedManually2008, setModalClosedManually2008] = useState(false);
    const [modalClosedManually2013, setModalClosedManually2013] = useState(false);
    const [lastYearOpened, setLastYearOpened] = useState(null);
    const [isTooltipMapVisible, setIsTooltipMapVisible] = useState(false);
    const [tooltipMapPosition, setTooltipMapPosition] = useState({ top: 0, left: 0 });
    const [isTooltipHeatmapVisible, setIsTooltipHeatmapVisible] = useState(false);
    const [tooltipHeatmapPosition, setTooltipHeatmapPosition] = useState({ top: 0, left: 0 });
    const [isTooltipInfoVisible, setIsTooltipInfoVisible] = useState(false);
    const [tooltipInfoPosition, setTooltipInfoPosition] = useState({ top: 0, left: 0 });

    const [averageRateHombres, setAverageRateHombres] = useState(0);
    const [averageRateMujeres, setAverageRateMujeres] = useState(0);

    // Función para agregar datos usando d3.rollups
    const aggregateData = useCallback((data) => {
        return d3.rollups(data, v => ({
            totalFrecuencia: d3.sum(v, d => +d.Total),
            avgTasa: d3.sum(v, d => d.tasa_fallecimiento * d.Total) / d3.sum(v, d => +d.Total),
            nombreProvincia: v[0]['Nombre Provincia']
        }), d => d.Año, d => d.Código.padStart(2, '0')).map(([year, codes]) => ({
            year,
            codes: Object.fromEntries(codes.map(([code, data]) => [code, data]))
        }));
    }, []);

    // useEffect para cargar los datos
    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            fetch(process.env.PUBLIC_URL + '/data/spain-provinces.geojson').then(response => response.json()),
            fetch(process.env.PUBLIC_URL + '/data/spain-provinces.geojson').then(response => response.json()),
            fetch(process.env.PUBLIC_URL + '/data/spain-provinces.geojson').then(response => response.json()),
            fetch(process.env.PUBLIC_URL + '/data/spain-provinces.geojson').then(response => response.json()),
            d3.csv(process.env.PUBLIC_URL + '/data/mortalidad_hombres.csv'),
            d3.csv(process.env.PUBLIC_URL + '/data/mortalidad_mujeres.csv')
        ]).then(([hombresModalGeoJSON, mujeresModalGeoJSON,hombresGeoJSON, mujeresGeoJSON, hombresData, mujeresData]) => {
            setGeoJSONHombres(hombresGeoJSON);
            setGeoJSONMujeres(mujeresGeoJSON);
            setGeoJSONModalHombres(hombresModalGeoJSON);
            setGeoJSONModalMujeres(mujeresModalGeoJSON);
            setMortalityDataSaveHombres(hombresData);
            setMortalityDataSaveMujeres(mujeresData);
            const combinedMortalityData = [...hombresData, ...mujeresData];
            setMortalityData(combinedMortalityData);
            setAggregatedDataHombres(aggregateData(hombresData));
            setAggregatedDataMujeres(aggregateData(mujeresData));
            
            setIsLoading(false);
        }).catch(error => {
            console.error('Error al cargar los datos:', error);
            setIsLoading(false);
        });
    }, [aggregateData]);

    // Función para calcular el promedio ponderado
    const calculateWeightedAverage = useCallback((data) => {
        const totalWeight = d3.sum(data, d => +d.Total);
        const weightedSum = d3.sum(data, d => +d.tasa_fallecimiento * +d.Total);
        return (weightedSum / totalWeight);
    }, []);

    // Función para calcular las tasas promedio para un año seleccionado
    const calculateAverageRatesForYear = useCallback((selectedYear) => {
        const filteredHombres = mortalityDatasaveHombres.filter(d => d.Año === String(selectedYear));
        const filteredMujeres = mortalityDatasaveMujeres.filter(d => d.Año === String(selectedYear));

        const avgRateHombres = calculateWeightedAverage(filteredHombres);
        const avgRateMujeres = calculateWeightedAverage(filteredMujeres);

        setAverageRateHombres(avgRateHombres);
        setAverageRateMujeres(avgRateMujeres);
    }, [mortalityDatasaveHombres, mortalityDatasaveMujeres, calculateWeightedAverage]);

    // useEffect para actualizar las tasas promedio cuando cambie el año o termine de cargar
    useEffect(() => {
        if (!isLoading) {
            calculateAverageRatesForYear(year);
        }
    }, [year, isLoading, calculateAverageRatesForYear]);

    // useEffect para configurar GSAP y ScrollTrigger
    useEffect(() => {
        if (!isLoading) {
            console.log('Iniciando GSAP y ScrollTrigger...');
            const totalYears = 2022 - 1998 + 3;

            const updateYear = (progress) => {
                const newYear = 1998 + Math.floor(progress * totalYears);
                setYear(newYear);
                setIsCovidYearActive(newYear === 2020);
                
                if (newYear === 2008 && !modalClosedManually2008 && lastYearOpened !== 2008) {
                    setIsModalVisible2008(true);
                    setLastYearOpened(2008);
                } else if (newYear !== 2008) {
                    setIsModalVisible2008(false);
                    setModalClosedManually2008(false);
                    setLastYearOpened(newYear);
                }
                if (newYear === 2013 && !modalClosedManually2013 && lastYearOpened !== 2013) {
                    setIsModalVisible2013(true);
                    setLastYearOpened(2013);
                } else if (newYear !== 2013) {
                    setIsModalVisible2013(false);
                    setModalClosedManually2013(false);
                    setLastYearOpened(newYear);
                }
            };

            // Configuración de ScrollTrigger
            const scrollTrigger = ScrollTrigger.create({
                trigger: "#main-content",
                start: "top top",
                end: "bottom top",
                scrub: true,
                pin: true,
                pinSpacing: false,
                onUpdate: (self) => {
                    updateYear(self.progress);
                }
            });

            return () => {
                scrollTrigger.kill();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, [isLoading, modalClosedManually2008, modalClosedManually2013, lastYearOpened]);

    // Funciones para cerrar los modales
    const onClose2008 = () => {
        setIsModalVisible2008(false);
        setModalClosedManually2008(true);
    };

    const onClose2013 = () => {
        setIsModalVisible2013(false);
        setModalClosedManually2013(true);
    };

    // Funciones para manejar los tooltips
    const handleTooltipMapButtonClick = (event) => {
        const { clientX, clientY } = event;
        setTooltipMapPosition({ top: clientY, left: clientX });
        setIsTooltipMapVisible(true);
    };

    const handleTooltipHeatmapButtonClick = (event) => {
        const { clientX, clientY } = event;
        setTooltipHeatmapPosition({ top: clientY, left: clientX });
        setIsTooltipHeatmapVisible(true);
    };

    const handleTooltipInfoButtonClick = (event) => {
        const { clientX, clientY } = event;
        setTooltipInfoPosition({ top: clientY, left: clientX });
        setIsTooltipInfoVisible(true);
    };

    
    return (
        <div id="main-content" style={{ height: '1000vh'}}>
            <h1 style={{ fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif', textAlign: 'center' }}>
                Análisis de la Mortalidad en España: Un Enfoque por Género y Edad (1998-2022)
            </h1>
            {/* Mensaje para el año de COVID-19 */}
            {isCovidYearActive && <div style={{ padding: '1px', backgroundColor: 'yellow', textAlign: 'center', margin: '-20px 10px 10px 0' }}>
                Observando el impacto de la pandemia del COVID-19 en 2020.
            </div>}
            <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', margin: '10px 10px 10px 0' }}>
                {isLoading ? (
                    <p>Cargando datos...</p>
                ) : (
                    <>
                        {geoJSONHombres && geoJSONMujeres && aggregatedDataHombres && aggregatedDataMujeres && mortalityDatasaveHombres && mortalityDatasaveMujeres && (
                            <>
                                <Map key={`hombres-${year}`} id="hombres" year={year} gender="Hombres" geoJSON={geoJSONHombres} aggregatedData={aggregatedDataHombres} mortalityData={mortalityDatasaveHombres} modal_bool={false} />
                                <VerticalProgressBar id="hombres" value={averageRateHombres} title="Promedio Hombres" />
                                <Map key={`mujeres-${year}`} id="mujeres" year={year} gender="Mujeres" geoJSON={geoJSONMujeres} aggregatedData={aggregatedDataMujeres} mortalityData={mortalityDatasaveMujeres} modal_bool={false} />
                                <VerticalProgressBar id="mujeres" value={averageRateMujeres} title="Promedio Mujeres" />
                                <div style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', marginRight: '0px' }}>                                
                                    <button className="button-info" onClick={handleTooltipInfoButtonClick}>Información del Proyecto</button>
                                    <input
                                        type="range"
                                        min="1998"
                                        max="2022"
                                        value={year}
                                        onChange={e => setYear(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                    <p style={{ textAlign: 'center', fontSize: '22px', fontFamily: '"Georgia Neue", Georgia, Arial, sans-serif', fontWeight: 'bold'}}>
                                        Año seleccionado: {year}
                                    </p>
                                    <button className="button-modern" onClick={handleTooltipMapButtonClick}>Ver Leyenda del Mapa</button>
                                    <button className="button-modern" onClick={handleTooltipHeatmapButtonClick}>Ver Valores del Heatmap</button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
            <div style={{ position: 'relative'}}>
                {isLoading ? (
                    <p>Preparando visualización...</p>
                ) : (
                    mortalityData && !isLoading && mortalityData.length > 0 && (
                        <div style={{ position: 'flex', top: '50%', left: '0%', transform: 'translate(-0%, -0%)', marginTop: '0px'}}>
                            <HeatMap data={mortalityData} year={year} ismodal={false}/>
                        </div>
                    )
                )}
                {/* Modales para los años específicos */}
                {isModalVisible2008 && aggregatedDataHombres && mortalityDatasaveHombres && aggregatedDataMujeres && mortalityDatasaveMujeres && (
                    <MapModal
                        year="1998"
                        onClose2008={onClose2008}
                        geoJSONHombres={geoJSONModalHombres}
                        geoJSONMujeres={geoJSONModalMujeres}
                        aggregatedDataHombres={aggregatedDataHombres}
                        aggregatedDataMujeres={aggregatedDataMujeres}
                        mortalityDatasaveHombres={mortalityDatasaveHombres}
                        mortalityDatasaveMujeres={mortalityDatasaveMujeres}
                    />
                )}

                {isModalVisible2013 && mortalityData && (
                    <HeatMapModal
                        year="1998"
                        onClose2013={onClose2013}
                        mortalityData={mortalityData}
                    />
                )}
                {/* Tooltips */}
                {isTooltipMapVisible && <TooltipMap onClose={() => setIsTooltipMapVisible(false)} top={tooltipMapPosition.top} left={tooltipMapPosition.left} />}
                {isTooltipHeatmapVisible && <TooltipHeatmap onClose={() => setIsTooltipHeatmapVisible(false)} top={tooltipHeatmapPosition.top} left={tooltipHeatmapPosition.left} />}
                {isTooltipInfoVisible && <TooltipInfo onClose={() => setIsTooltipInfoVisible(false)} top={tooltipInfoPosition.top} left={tooltipInfoPosition.left} />}
            </div>
        </div>
    );
};

export default App;
