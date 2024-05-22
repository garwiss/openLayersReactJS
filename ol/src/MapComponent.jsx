import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Draw from 'ol/interaction/Draw';
import { fromLonLat, toLonLat } from 'ol/proj';
import { jsPanel } from 'jspanel4/es6module/jspanel.min.js';
import { QueryPoint } from './QueryPoint.jsx';
import './Map.css'

const turkeyCoordinate = fromLonLat([34.9998, 39.42152]);
const url = 'https://localhost:7196/api/Door';

function MapComponent() {
    const [drawType, setDrawType] = useState('');
    const [coordinates, setCoordinates] = useState([]);
    const [geometryType, setGeometryType] = useState('');
    const [name, setName] = useState('');
    const mapRef = useRef(null);
    const sourceRef = useRef(new VectorSource({ wrapX: false }));
    const drawRef = useRef(null);
    const map = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            const features = data.map(coordinate => {
                const lonLat = [coordinate.x, coordinate.y];
                return new Feature({
                    geometry: new Point(lonLat).transform('EPSG:4326', 'EPSG:3857'),
                });
            });
            sourceRef.current.addFeatures(features);
        })
        .catch(error => console.error('Veritabanından koordinatlar alınırken bir hata oluştu:', error));

        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorLayer = new VectorLayer({
            source: sourceRef.current,
        });

        map.current = new Map({
            layers: [rasterLayer, vectorLayer],
            target: mapRef.current,
            view: new View({
                center: turkeyCoordinate,
                zoom: 6.8,
            }),
        });

        const handleDrawEnd = (event) => {
            const coords = event.feature.getGeometry().getLastCoordinate();
            const lonLat = toLonLat(coords);
            setCoordinates([...coordinates, lonLat]);
            setGeometryType(event.feature.getGeometry().getType());

            jsPanel.create({
                theme: 'white',
                headerLogo: '<i class="fas fa-home ml-2"></i>',
                headerTitle: 'I\'m a jsPanel',
                headerToolbar: '<span class="text-sm">Just some text in optional</span>',
                content: `
                    <p>Longitude: ${lonLat[0]}</p>
                    <p>Latitude: ${lonLat[1]}</p>
                    <input type="text" value="${name}" id="nameInput" />
                    <button id="kaydetButton">Kaydet</button>
                `,
                callback: function (panel) {
                    const kaydetButton = panel.querySelector('#kaydetButton');
                    const nameInput = panel.querySelector('#nameInput');

                    kaydetButton.addEventListener('click', () => {
                        const data = {
                            x: lonLat[0],
                            y: lonLat[1],
                            name: nameInput.value
                        };
                        fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Handle successful response
                        })
                        .catch(error => {
                            console.error('There was a problem with your fetch operation:', error);
                        });
                        panel.close();
                    });
                }
            });

            if (drawRef.current) {
                map.current.removeInteraction(drawRef.current);
            }
        };

        const handleDrawChange = () => {
            if (drawRef.current) {
                map.current.removeInteraction(drawRef.current);
            }
            if (drawType !== '') {
                drawRef.current = new Draw({
                    source: sourceRef.current,
                    type: drawType,
                });
                drawRef.current.on('drawend', handleDrawEnd);
                map.current.addInteraction(drawRef.current);
            }
        };

        handleDrawChange();

        return () => map.current.dispose();
    }, [drawType]);

    const handleDrawTypeChange = (event) => {
        const selectedType = event.target.value;
        setDrawType(selectedType);
    };

    const handleUndoClick = () => {
        if (drawRef.current) {
            drawRef.current.removeLastPoint();
        }
    };

    const queryClick = () => {
        QueryPoint();
    };

    return (
        <>
            <div id="map" ref={mapRef}></div>
            <select id="type" value={drawType} onChange={handleDrawTypeChange}>
                <option value="None">None</option>
                <option value="Point">Point</option>
                <option value="LineString">LineString</option>
                <option value="Polygon">Polygon</option>
                <option value="Circle">Circle</option>
            </select>
            <button id="undo" onClick={handleUndoClick}>Undo</button>
            <button onClick={queryClick}>QueryPoint</button>
        </>
    );
}

export default MapComponent;
