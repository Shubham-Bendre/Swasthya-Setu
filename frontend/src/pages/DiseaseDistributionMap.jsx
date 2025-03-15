import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import geoData from './us-states'; 

const DiseaseDistributionMap = () => {
  const [statesData, setStatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('all');
  const geoJsonLayerRef = useRef(null);

  // Function to get color based on density value
  const getColor = (d) => {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
  };

  // Style function for states
  const style = (feature) => {
    // Calculate disease density from our data
    const stateName = feature.properties.name;
    const diseaseCount = getDiseaseCount(stateName, selectedDisease);
    
    return {
      fillColor: getColor(diseaseCount),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  // Highlight feature on mouseover
  const highlightFeature = (e) => {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    
    info.update(layer.feature.properties);
  };

  // Reset highlight on mouseout
  const resetHighlight = (e) => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.resetStyle(e.target);
    }
    info.update();
  };

  // Zoom to feature on click
  const zoomToFeature = (e) => {
    e.target._map.fitBounds(e.target.getBounds());
  };

  // Add these listeners to each state
  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  };

  // Get disease count for a state
  const getDiseaseCount = (stateName, diseaseType) => {
    // This would be replaced with actual data from your API
    // Sample data mapping states to disease counts
    const diseaseData = {
      'Alabama': { 'total': 94, 'Diabetes': 35, 'Hypertension': 42, 'COVID-19': 17 },
      'Alaska': { 'total': 28, 'Diabetes': 8, 'Hypertension': 12, 'COVID-19': 8 },
      'Arizona': { 'total': 303, 'Diabetes': 120, 'Hypertension': 145, 'COVID-19': 38 },
      'Arkansas': { 'total': 87, 'Diabetes': 32, 'Hypertension': 45, 'COVID-19': 10 },
      'California': { 'total': 1200, 'Diabetes': 450, 'Hypertension': 550, 'COVID-19': 200 },
      'Colorado': { 'total': 250, 'Diabetes': 85, 'Hypertension': 120, 'COVID-19': 45 },
      'Connecticut': { 'total': 180, 'Diabetes': 65, 'Hypertension': 90, 'COVID-19': 25 },
      'Delaware': { 'total': 45, 'Diabetes': 15, 'Hypertension': 22, 'COVID-19': 8 },
      'Florida': { 'total': 780, 'Diabetes': 290, 'Hypertension': 380, 'COVID-19': 110 },
      'Georgia': { 'total': 450, 'Diabetes': 170, 'Hypertension': 220, 'COVID-19': 60 },
      'Hawaii': { 'total': 65, 'Diabetes': 22, 'Hypertension': 32, 'COVID-19': 11 },
      'Idaho': { 'total': 75, 'Diabetes': 28, 'Hypertension': 36, 'COVID-19': 11 },
      'Illinois': { 'total': 550, 'Diabetes': 205, 'Hypertension': 270, 'COVID-19': 75 },
      'Indiana': { 'total': 290, 'Diabetes': 110, 'Hypertension': 140, 'COVID-19': 40 },
      'Iowa': { 'total': 135, 'Diabetes': 50, 'Hypertension': 65, 'COVID-19': 20 },
      'Kansas': { 'total': 120, 'Diabetes': 45, 'Hypertension': 58, 'COVID-19': 17 },
      'Kentucky': { 'total': 190, 'Diabetes': 72, 'Hypertension': 93, 'COVID-19': 25 },
      'Louisiana': { 'total': 210, 'Diabetes': 78, 'Hypertension': 105, 'COVID-19': 27 },
      'Maine': { 'total': 60, 'Diabetes': 22, 'Hypertension': 30, 'COVID-19': 8 },
      'Maryland': { 'total': 270, 'Diabetes': 100, 'Hypertension': 135, 'COVID-19': 35 },
      'Massachusetts': { 'total': 340, 'Diabetes': 125, 'Hypertension': 170, 'COVID-19': 45 },
      'Michigan': { 'total': 420, 'Diabetes': 155, 'Hypertension': 210, 'COVID-19': 55 },
      'Minnesota': { 'total': 240, 'Diabetes': 90, 'Hypertension': 120, 'COVID-19': 30 },
      'Mississippi': { 'total': 120, 'Diabetes': 45, 'Hypertension': 60, 'COVID-19': 15 },
      'Missouri': { 'total': 280, 'Diabetes': 105, 'Hypertension': 140, 'COVID-19': 35 },
      'Montana': { 'total': 45, 'Diabetes': 17, 'Hypertension': 22, 'COVID-19': 6 },
      'Nebraska': { 'total': 85, 'Diabetes': 32, 'Hypertension': 42, 'COVID-19': 11 },
      'Nevada': { 'total': 140, 'Diabetes': 52, 'Hypertension': 70, 'COVID-19': 18 },
      'New Hampshire': { 'total': 65, 'Diabetes': 24, 'Hypertension': 32, 'COVID-19': 9 },
      'New Jersey': { 'total': 390, 'Diabetes': 145, 'Hypertension': 195, 'COVID-19': 50 },
      'New Mexico': { 'total': 85, 'Diabetes': 32, 'Hypertension': 42, 'COVID-19': 11 },
      'New York': { 'total': 830, 'Diabetes': 310, 'Hypertension': 415, 'COVID-19': 105 },
      'North Carolina': { 'total': 420, 'Diabetes': 155, 'Hypertension': 210, 'COVID-19': 55 },
      'North Dakota': { 'total': 30, 'Diabetes': 11, 'Hypertension': 15, 'COVID-19': 4 },
      'Ohio': { 'total': 520, 'Diabetes': 195, 'Hypertension': 260, 'COVID-19': 65 },
      'Oklahoma': { 'total': 165, 'Diabetes': 62, 'Hypertension': 82, 'COVID-19': 21 },
      'Oregon': { 'total': 180, 'Diabetes': 67, 'Hypertension': 90, 'COVID-19': 23 },
      'Pennsylvania': { 'total': 580, 'Diabetes': 215, 'Hypertension': 290, 'COVID-19': 75 },
      'Rhode Island': { 'total': 52, 'Diabetes': 19, 'Hypertension': 26, 'COVID-19': 7 },
      'South Carolina': { 'total': 215, 'Diabetes': 80, 'Hypertension': 107, 'COVID-19': 28 },
      'South Dakota': { 'total': 38, 'Diabetes': 14, 'Hypertension': 19, 'COVID-19': 5 },
      'Tennessee': { 'total': 290, 'Diabetes': 108, 'Hypertension': 145, 'COVID-19': 37 },
      'Texas': { 'total': 1050, 'Diabetes': 390, 'Hypertension': 525, 'COVID-19': 135 },
      'Utah': { 'total': 135, 'Diabetes': 50, 'Hypertension': 67, 'COVID-19': 18 },
      'Vermont': { 'total': 28, 'Diabetes': 10, 'Hypertension': 14, 'COVID-19': 4 },
      'Virginia': { 'total': 380, 'Diabetes': 140, 'Hypertension': 190, 'COVID-19': 50 },
      'Washington': { 'total': 320, 'Diabetes': 120, 'Hypertension': 160, 'COVID-19': 40 },
      'West Virginia': { 'total': 85, 'Diabetes': 32, 'Hypertension': 42, 'COVID-19': 11 },
      'Wisconsin': { 'total': 250, 'Diabetes': 93, 'Hypertension': 125, 'COVID-19': 32 },
      'Wyoming': { 'total': 24, 'Diabetes': 9, 'Hypertension': 12, 'COVID-19': 3 }
    };

    const stateData = diseaseData[stateName];
    if (!stateData) return 0;
    
    return diseaseType === 'all' ? stateData.total : (stateData[diseaseType] || 0);
  };

  // Control that shows state info on hover
  const info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    const diseaseType = selectedDisease === 'all' ? 'Total Cases' : selectedDisease;
    this._div.innerHTML = '<h4>US Disease Distribution</h4>' + 
      (props ?
        '<b>' + props.name + '</b><br />' + 
        getDiseaseCount(props.name, selectedDisease) + ' ' + diseaseType + ' cases'
        : 'Hover over a state');
  };

  // Legend control
  const legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
    let labels = [];
    let from, to;

    for (let i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];

      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  // Load US States GeoJSON data
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        // This would fetch the US states GeoJSON from your server
        // For demo, we'll use a simplified approach
        
        // Define a simple fetchStatesData function that would normally fetch from API
// Replace the fetchStatesData function with:
const fetchStatesData = async () => {
  return geoData; // No need for fetch, just return the object
};
        
        const data = await fetchStatesData();
        setStatesData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load US states data: " + err.message);
        setLoading(false);
      }
    };

    fetchGeoData();
  }, []);

  // Available diseases for the filter
  const availableDiseases = ['all', 'Diabetes', 'Hypertension', 'COVID-19'];

  // Update when disease selection changes
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.setStyle(style);
    }
  }, [selectedDisease]);

  // Custom CSS for info and legend controls
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .info {
        padding: 6px 8px;
        font: 14px/16px Arial, Helvetica, sans-serif;
        background: white;
        background: rgba(255,255,255,0.8);
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
        border-radius: 5px;
      }
      .info h4 {
        margin: 0 0 5px;
        color: #777;
      }
      .legend {
        text-align: left;
        line-height: 18px;
        color: #555;
      }
      .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading map data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold mb-2">US Disease Distribution Map</h2>
        <div className="flex items-center space-x-4">
          <span>Filter by disease:</span>
          <select 
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="py-1 px-3 border rounded-md"
          >
            {availableDiseases.map(disease => (
              <option key={disease} value={disease}>
                {disease === 'all' ? 'All Diseases' : disease}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 text-sm">
          <p>This choropleth map shows disease distribution across US states. Hover over a state to see details, or click to zoom.</p>
          <p className="mt-1 text-gray-600 italic">
            Colors indicate disease prevalence - darker colors represent higher case numbers.
          </p>
        </div>
      </div>
      
      <div className="h-96 w-full relative">
        <MapContainer 
          center={[37.8, -96]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {statesData && (
            <GeoJSON
              data={statesData}
              style={style}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
          )}
        </MapContainer>
      </div>
      
      <div className="p-4 bg-gray-50 text-sm">
        <div className="font-bold mb-1">Integration Notes:</div>
        <ul className="list-disc ml-5 space-y-1">
          <li>Replace sample disease data with your CRUD API endpoint</li>
          <li>Connect map to your notification system when thresholds are exceeded</li>
          <li>Set up WebSockets or polling for real-time updates</li>
        </ul>
      </div>
    </div>
  );
};

export default DiseaseDistributionMap;