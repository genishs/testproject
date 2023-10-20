// MapTest.js
import React, { useEffect, useRef } from "react";

import { Map as OlMap, View } from "ol";
import { fromLonLat, } from "ol/proj";
import { Tile as TileLayer, Vector as VectorLayer, } from "ol/layer";
import { Vector as VectorSource, OSM } from "ol/source";
import { GeoJSON } from "ol/format";
import "ol/ol.css";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";

export default function MapTest(options = {}) {

  // OlMap 타겟 지정을 위해 사용 (id를 지정 대신)
  const mapContent = useRef(null);

  useEffect(() => {

    if (!mapContent.current) {
      return;
    }

 		//4326, 3857은 기본적으로 등록되있고 나머지 사용할 EPSG는 등록
		//proj4.defs([['EPSG:5179', '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs']]);
		//proj4.defs([['EPSG:5186', '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs']]);
		//register(proj4);

    //console.log('@@@@@@ GisApp', GisApp.FROM_PROJ, GisApp.TO_PROJ);

    const map = new OlMap({
      //controls: defaultControls({ zoom: false, rotate: false }).extend([]),
      layers: [
        new TileLayer({
          source: new OSM(),
          //source : new XYZ({ url: "http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png", crossOrigin: 'anonymous', }),
        }),
        new VectorLayer({
          source: new VectorSource({
            url:`${process.env.PUBLIC_URL}/data/geojson/seoulHD.geojson`, //geojson 파일
            format: new GeoJSON()
          }),
          style : new Style({
            stroke : new Stroke({
              color : "rgba(255,0,0,0.8)",
              width : 2,
            })
          })
        }),
      ],
      view: new View({
        //projection: getProjection("EPSG:5186"),
        center: fromLonLat([126.8096364, 37.563429]),
        //center: fromLonLat([location.latitude, location.longitude]),
        zoom: 14,
        //minZoom: 7,
        maxZoom: 22,
      }),
      target: mapContent.current,
    });

    //return () => map.setTarget(undefined);
  }, []);



  return (
    <><div className="gis-map-wrap">
        <div style={{width:1000, height:500}} ref={mapContent}></div>
    </div>
    </>
  );
}
