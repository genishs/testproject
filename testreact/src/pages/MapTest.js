// MapTest.jsx
import React, { useEffect, useRef } from "react";

import { Map as OlMap, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat, get as getProjection } from "ol/proj";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { XYZ, Vector as VectorSource, OSM } from "ol/source";
import "ol/ol.css";

export default function MapTest() {
  // OlMap 타겟 지정을 위해 사용 (id를 지정 대신)
  const mapContent = useRef(null);
  
  // 추후 객체를 추가하기 위한 레이어(점, 선, 도형)
  const initVectorLayer = new VectorLayer({
    source: new VectorSource(),
  });

  useEffect(() => {
    if (!mapContent.current) {
      return;
    }

    const map = new OlMap({
      controls: defaultControls({ zoom: false, rotate: false }).extend([]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        initVectorLayer,
      ],
      view: new View({
        projection: getProjection("EPSG:3857"),
        center: fromLonLat([127.296364, 37.503429]),
        zoom: 15,
        minZoom: 7,
        maxZoom: 20,
      }),
      target: mapContent.current,
    });

    return () => map.setTarget(undefined);
  }, []);



  return (
    <div className="gis-map-wrap">
      <div style={{width:800, height:800}} ref={mapContent}></div>
    </div>
    
  );
}