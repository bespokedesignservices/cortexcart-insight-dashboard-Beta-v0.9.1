'use client';

import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const VisitorMap = ({ data = [] }) => {
  const [tooltipContent, setTooltipContent] = useState('');

  const dataMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(data)) {
        data.forEach(item => {
            if (item.id) {
                map.set(item.id, Number(item.value) || 0);
            }
        });
    }
    return map;
  }, [data]);

  const colorScale = scaleQuantile()
    .domain(Array.from(dataMap.values()))
    .range([
      "#ffedea", "#ffcec5", "#ffad9f", "#ff8a75", "#ff5533",
      "#e2492d", "#be3d26", "#9a311f", "#782618"
    ]);

  return (
    <div className="w-full h-full relative" data-tip="">
      <ComposableMap projectionConfig={{ scale: 180 }}>
        <ZoomableGroup center={[0, 20]}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                // Corrected: Use lowercase 'iso_a2' and 'name' to match the map data properties.
                // The map file provides these properties in all lowercase.
                const views = dataMap.get(geo.properties.iso_a2) || 0;
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const countryName = geo.properties.name || 'Unknown';
                      setTooltipContent(`${countryName} — ${views.toLocaleString()} views`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                    style={{
                      default: {
                        fill: views > 0 ? colorScale(views) : '#F5F4F6',
                        outline: 'none'
                      },
                      hover: {
                        fill: '#E42',
                        outline: 'none'
                      },
                      pressed: {
                        fill: '#E42',
                        outline: 'none'
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && <div className="absolute top-0 left-0 bg-black text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-y-full">{tooltipContent}</div>}
    </div>
  );
};

export default VisitorMap;
