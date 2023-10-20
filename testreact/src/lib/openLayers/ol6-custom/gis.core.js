import MousePosition from 'ol/control/MousePosition.js';
import ScaleLine from 'ol/control/ScaleLine.js';
import Feature from 'ol/Feature.js';
import WKT from 'ol/format/WKT.js';
import LinearRing from 'ol/geom/LinearRing.js';
import Draw from 'ol/interaction/Draw.js';
import TileLayer from 'ol/layer/Tile.js';
import * as olProj from 'ol/proj';
import VectorSource from 'ol/source/Vector.js';
import XYZ from 'ol/source/XYZ.js';
import GisOlLayer from './gis.layer';
import GeoSJON from 'ol/format/GeoJSON.js';
import { baseURL } from 'web/js/apis/instance';
import GisOlEditLayer from './gis.edit';

const GisApp = {};
/**
 * GisApp 전역변수 생성
 */
//레이어 정보
GisApp.layerInfos = [];
//기본정보
GisApp.GEOSERVER_URL = 'http://183.98.25.8:30080/geoserver/sams/ows';
GisApp.EMAP_URL = '/emap/';
GisApp.EMAP_SATELLITE_URL = '/emap/satellite/';
GisApp.VWORLD_URL = 'http://xdworld.vworld.kr:8080/2d/Base/service/{z}/{x}/{y}.png';
GisApp.VWORLD_SATELLITE_URL = 'http://xdworld.vworld.kr:8080/2d/Satellite/service/{z}/{x}/{y}.jpeg';
GisApp.DAUM_ROADVIEW_URL = 'http://map{s}.daumcdn.net/map_roadviewline/7.00/L{z}/{y}/{x}.png';
GisApp.OPENSTREET_URL = '//tile.openstreetmap.org/{z}/{x}/{y}.png';
GisApp.FROM_PROJ = 'EPSG:4326';
GisApp.TO_PROJ = 'EPSG:5179';
GisApp.TO_DATA_PROJ = 'EPSG:5186';
GisApp.CONTEXT_LAYER_PATH = process.env.PUBLIC_URL + '/images/gis/layericon/';
GisApp.layerCode = {};
GisApp.hlLayerId = 'highLightFeatureList';
GisApp.hLayerId = 'highLightFeature';
GisApp.hlEvlLayerId = 'highLightEvlLayer';
GisApp.locgovCd = '';
GisApp.bizCd = '';

GisApp.Module = {
	core: null,
	select: null,
	measure: null,
	layer: null,
	style: null,
	edit: null,
};

/**
 * GisApp.layerInfos Set
 */
GisApp.setLayerInfos = function (layerInfos) {
	GisApp.layerInfos = layerInfos;
};

/**
 * GisApp core
 * @requires gis.layer.js
 * @requires gis.reset.js
 */
GisApp.core = function (options) {
	GisApp.core.prototype.initialize(options);
};

GisApp.core.prototype = {
	defaults: {
		target: '',
		centerX: 37.2806094,
		centerY: 127.0032502,
		zoom: 11,
		minZoom: 1,
		maxZoom: 18,
	},
	options: {
		1: { zoom: 16, minZoom: 10, maxZoom: 22, centerX: 35.3227711, centerY: 129.1836202, dataProj: 'EPSG:5186', srid: 5186 },
		2: { zoom: 16, minZoom: 10, maxZoom: 22, centerX: 35.1790458, centerY: 129.0742274, dataProj: 'EPSG:5186', srid: 5186 },
		4: { zoom: 16, minZoom: 10, maxZoom: 22, centerX: 35.0140499, centerY: 126.7110757, dataProj: 'EPSG:5186', srid: 5186 },
		14: { zoom: 16, minZoom: 10, maxZoom: 22, centerX: 34.9390499, centerY: 127.6960757, dataProj: 'EPSG:5186', srid: 5186 },
	},
	reset: null,
	epsg_5179: null,
	map: null, // ol.Map
	view: {}, // ol.view
	interactions: {}, // interaction 모음 객체
	selectedFeature: null, // 현재 선택된 feature
	baseLayers: {},
	baseMiniMapLayers: {},
	layers: {},
	initialize: function (options) {
		let option = this.options['1'];
		if (option) {
			Object.assign(this.defaults, option);
			GisApp.TO_DATA_PROJ = option.dataProj;
		}
		Object.assign(this.defaults, options);
		GisApp.Module.core = this;
		GisApp.Module.layer = new GisOlLayer(this.defaults);
		GisApp.Module.edit = new GisOlEditLayer(this.defaults);

		this.baseMiniMapLayers['base'] = this.getBaseMap('minimap-base');
		this.baseLayers['base'] = this.getBaseMap('emap');
		this.baseLayers['satellite'] = this.getBaseMap('satellite');
		this.baseMiniMapLayers['base'] = this.getBaseMap('minimap-base');
	},
	layerType: {
		point: 'POINT',
		line: 'LINE',
		poligon: 'POLIGON',
	},
	chgOptions: function (fcltCd) {
		let option = this.options[fcltCd];
		Object.assign(this.defaults, option);
	},
	getBaseMap: function (_id) {
		let url = GisApp.VWORLD_URL;
		if (_id === 'satellite') {
			url = GisApp.VWORLD_SATELLITE_URL;
		}
		let baseMap = new TileLayer({
			id: _id,
			visible: true,
			type: 'base',
			source: new XYZ({
				url: url,
				crossOrigin: 'anonymous',
			}),
			zIndex: 0,
		});
		url = GisApp.EMAP_URL;
		if (_id === 'satellite') {
			url = GisApp.EMAP_SATELLITE_URL;
		}
		return baseMap;
	},
	/**
	 * [사용]테이블명으로 레이어 아이디 조회
	 */
	getLayerCodeByTbNm: function (_tableNm) {
		let returnLayerCode = null;
		for (let i in GisApp.layerCode) {
			let layerCode = GisApp.layerCode[i];
			if (layerCode.tableName === _tableNm) {
				returnLayerCode = layerCode;
			}
		}
		return returnLayerCode;
	},
	/**
	 * [사용]베이스 레이어 변경
	 * Parameters:
	 * _title - {String} 베이스 레이어 이름
	 *
	 * Returns:
	 */
	changeBaseLayer: function (_id) {
		this.map.getLayers().forEach(function (layer) {
			let type = layer.get('type');
			let id = layer.get('id');
			if (type == 'base') {
				if (id == _id) {
					layer.setVisible(true);
				} else {
					layer.setVisible(false);
				}
			}
		});
	},
	/**
	 * [사용]지도 중심좌표 설정
	 */
	setCenter: function (x, y, transYn) {
		if (!x || !y) return;
		let view = this.map.getView();
		if (!transYn) {
			// 값이 없으면
			let center = olProj.transform([Number(y), Number(x)], GisApp.FROM_PROJ, GisApp.TO_PROJ);
			view.setCenter(center);
		} else {
			view.setCenter([Number(x), Number(y)]);
		}
	},
	/*
	 * [사용]zoom 설정
	 */
	setZoom: function (zoom) {
		if (!zoom) return;
		this.map.getView().setZoom(zoom);
	},
	/*
	 * [사용]zoom 정보 반환
	 */
	getZoom: function () {
		return this.map.getView().getZoom();
	},
	/**
	 * [사용]레이어 맵에 추가(외부에서 생성된 layer를 파라미터로 받아 맵에 추가)
	 */
	setWfsLayerOnMap: function (layer) {
		this.deleteLayer(layer.get('id'));
		this.map.addLayer(layer);
		return layer;
	},
	/**
	 * [사용]레이어 생성(지오서버에서 WFS 방식으로 레이어정보 가져와 레이어 생성)
	 */
	getWfsLayer: function (layerCodeObj, addLayerOpt) {
		return GisApp.Module.layer.getWfsLayer(layerCodeObj, addLayerOpt);
	},
	/**
	 * [사용]레이어 맵에 추가(getWfsLayer 사용하여 레이어 생성)
	 */
	addWfsLayer: function (layerCodeObj, addLayerOpt) {
		let layer = this.getWfsLayer(layerCodeObj, addLayerOpt);
		this.deleteLayer(layer.get('id'));
		this.map.addLayer(layer);
		return layer;
	},
	/**
	 * [사용]레이어 삭제
	 */
	deleteLayer: function (layerId) {
		const map = this.map;
		if (!layerId) return;
		map.getLayers().forEach(function (layer) {
			let deleteLayer = null;
			if (layer != null && layer.get('id') != null) {
				let vlayerId = layer.get('id');
				if (vlayerId === layerId) {
					deleteLayer = layer;
				} else if (vlayerId.indexOf(layerId) > -1) {
					deleteLayer = layer;
				}
				if (deleteLayer) {
					map.removeLayer(deleteLayer);
				}
			}
		});
	},
	/**
	 * [사용]레이어 전체 삭제
	 */
	deleteAllLayer: function () {
		const map = this.map;
		map.getLayers().forEach(function (layer) {
			if (layer?.get('lyrYn') === 'Y') {
				map.removeLayer(layer);
			}
		});
	},
	/**
	 * [사용]레이어이름으로 레이어 조회 반환
	 */
	getLayerById: function (layerId) {
		if (!layerId) return;
		let layer = null;
		this.map.getLayers().forEach(function (el) {
			if (el != null && el.get('id') != null) {
				let vlayerId = el.get('id');
				if (vlayerId === layerId) {
					layer = el;
				}
			}
		});
		return layer;
	},
	/**
	 * [사용]오버레이 전체 삭제
	 */
	deleteAllOverlay: function () {
		let map = this.map;
		let overlays = map.getOverlays();
		if (overlays != null) {
			let overlayArray = overlays.getArray();
			let overlaySize = overlayArray.length;
			if (overlaySize > 0) {
				for (let i = overlaySize - 1; i >= 0; i--) {
					let overlay = overlayArray[i];
					map.removeOverlay(overlay);
				}
			}
		}
	},
	/**
	 * [사용]오버레이 아이디로 삭제
	 */
	deleteOverlay: function (_id) {
		let map = this.map;
		let overlays = map.getOverlays();
		if (overlays != null) {
			let overlayArray = overlays.getArray();
			let overlaySize = overlayArray.length;
			if (overlaySize > 0) {
				for (let i = overlaySize - 1; i >= 0; i--) {
					let overlay = overlayArray[i];
					let id = overlay.getId();
					if (id === _id) {
						map.removeOverlay(overlay);
					}
				}
			}
		}
	},
	/**
	 * [사용]맵 이벤트 삭제
	 */
	removeMapEventFnNm: function (handlerNm, fnNm) {
		let map = this.map;
		for (let i in map.listeners_[handlerNm]) {
			let listener = map.listeners_[handlerNm][i];
			if (listener.name == fnNm) {
				map.listeners_[handlerNm].splice(i, 1);
			}
		}
	},
	/**
	 * [사용]위경도 -> 시분초 변환
	 */
	coordTrans: function (coord) {
		let str = String(coord); /* String 변환 */
		let split = str.split('.'); /* 소수점 split */
		let hour = split[0]; /* 시간 */
		let minute = parseFloat((coord - parseInt(split[0]).toFixed(6)) * 60).toFixed(6);
		let min = String(minute).split('.')[0];
		let second = parseFloat((minute - parseInt(min)) * 60).toFixed(2);
		return hour + '도  ' + min + '분  ' + second + '초';
	},
	/**
	 * [사용]시분초  -> 위경도 변환
	 */
	coordTransrate: function (degree, minute, second) {
		let min = (Number(minute) / 60).toFixed(2);
		let sec = (Number(second) / 3600).toFixed(4);
		return degree + Number(min) + Number(sec);
	},
	/**
	 * [사용]마우스 좌표 위치
	 */
	mousePositionControl: function () {
		let element = document.getElementById('label_lonlat');
		let me = this;
		let mousePosition = new MousePosition({
			coordinateFormat: function (coordinate) {
				let text = '';
				if (element) {
					let lng = coordinate[0];
					let lat = coordinate[1];
					text += '경도 : ' + lng.toFixed(7) + ' ( ' + me.coordTrans(lng) + ' ) ';
					text += '위도 : ' + lat.toFixed(7) + '( ' + me.coordTrans(lat) + ' )';
				}
				return text;
			},
			projection: GisApp.FROM_PROJ,
			className: 'custom-mouse-position',
			target: document.getElementById('label_lonlat'),
		});
		this.map.addControl(mousePosition);
	},
	/**
	 * [사용]스케일 표시
	 */
	scaleControl: function () {
		let scale = new ScaleLine({
			minWidth: 100,
			units: 'metric',
		});
		this.map.addControl(scale);
	},
	/**
	 * [사용]레이어 맵에 셋팅
	 *
	 * Parameters:
	 * layerList - {Array} [layerNm : GisApp.layerCode 키]
	 * visible - {Boolean} 레이어 visible 여부
	 *
	 * Returns:
	 */
	setLayerOnMap: function (layerIds, visible, addQurryFlter) {
		for (let i in layerIds) {
			let id = layerIds[i];
			let layer = this.getLayerById(id);
			if (layer) {
				layer.setVisible(visible);
			} else if (visible) {
				const layerCode = GisApp.layerCode[id];
				const queryFlter = layerCode.queryFlter + ' ' + (addQurryFlter || '');
				layer = this.addWfsLayer({ ...layerCode, ...queryFlter });
			}
		}

		if (GisApp.Module.select) {
			this.setSelectInteraction();
		}
		if (GisApp.Module.edit.snap) {
			GisApp.Module.edit.setSnap();
		}
	},
	/**
	 * [사용]shp 파일 다운로드
	 */
	getShapeLayer: function (option) {
		GisApp.Module.layer.getShapeLayer(option);
	},
	/**
	 * [사용]레이어 셀렉트 가능하게 셋팅
	 */
	setSelectInteraction: function () {
		let layers = this.map.getLayers();
		if (layers) {
			for (let i in layers.array_) {
				let layer = layers.array_[i];
				if (layer.get('chcYn') === 'Y') {
					GisApp.Module.select.addLayer(layer);
				}
			}
		}
	},
	/**
	 * [사용]layerInfos(array) To layerCode(Object)
	 */
	convertLayerInfosToLayerCode: function (array, key, parentName) {
		let initialValue = {};
		for (let i = 0; i < array.length; i++) {
			let item = {};
			Object.assign(item, array[i]);
			if (parentName) {
				item.parentName = parentName;
			}
			initialValue[item[key]] = item;

			if (item.childList && item.childList.length > 0) {
				let child = this.convertLayerInfosToLayerCode(item.childList, key, item.name);
				Object.assign(initialValue, child);
			}
			if (initialValue[item[key]].childList) {
				delete initialValue[item[key]].childList;
			}
		}
		return initialValue;
	},
	/**
	 * [사용]피처 좌표값 WKT포맷으로 변경
	 */
	convertFeatureGeomToWKT: function (feature) {
		let geometry = feature.getGeometry();
		const wktGeom = this.convertGeomToWkt(geometry);
		return wktGeom;
	},
	/**
	 * [사용]WKT포맷 Geometry로 변경
	 */
	convertWktToGeom: function (wtkGeom) {
		let format = new WKT();
		let geom = format.readGeometry(wtkGeom);
		return geom;
	},
	/**
	 * [사용]좌표와 properties의 키값으로 피처 검색
	 */
	getFeatureGeomProp: function (geometry, ftrIds, ftrCde) {
		let returnFeature;
		this.map.getLayers().forEach(function (layer) {
			let type = layer.get('type');
			if (type != 'base') {
				let source = layer.getSource();

				let type = geometry.getType();
				let coordinates = geometry.getCoordinates();
				if (type.toUpperCase() === 'POINT') {
					coordinates = [coordinates];
				} else {
					coordinates = coordinates[0];
				}
				let featureFtrIds;
				let featureFtrCde;
				for (let i in coordinates) {
					let coordinate = coordinates[i];
					let feature = source.getClosestFeatureToCoordinate(coordinate);
					if (feature) {
						let properties = feature.getProperties();
						featureFtrIds = properties['FTR_IDS'];
						featureFtrCde = properties['FTR_CDE'];
						if (ftrIds == featureFtrIds && ftrCde == featureFtrCde) {
							returnFeature = feature;
						}
					}
				}
			}
		});
		return returnFeature;
	},
	/**
	 * [사용]관리번호로 피처검색
	 */
	getFeatureByFtrIdn: function (typeName, ftrIdn) {
		let returnFeature;
		this.map.getLayers().forEach(function (layer) {
			let layerTypeName = layer.get('typeName');
			if (layerTypeName === typeName) {
				layer
					.getSource()
					.getFeatures()
					.forEach(feature => {
						let featureFtrIdn = feature.get('ftrIdn');
						if (featureFtrIdn === ftrIdn) {
							returnFeature = feature;
						}
					});
			}
		});
		return returnFeature;
	},
	/**
	 * [사용]맵 이벤트 추가
	 */
	addMapEvent: function (evtNm, id, callback) {
		if (id) {
			let evt = this.map.on(evtNm, callback);
			evt.listener.id = id;
		}
	},
	/**
	 * [사용]맵 이벤트 삭제
	 */
	removeMapEvent: function (evtNm, id) {
		if (id) {
			let listeners = this.map.listeners_[evtNm];
			for (let i in listeners) {
				let listenter = listeners[i];
				if (listenter.id == id) {
					listeners.splice(i, 1);
				}
			}
		}
	},
	/**
	 * [사용]마커 그리기 추가
	 */
	drawMarker: function (layer, callback) {
		let map = this.map;
		let drawSource = layer.getSource();
		let draw = new Draw({
			type: 'Point',
			source: drawSource,
			condition: function (evt) {
				return true;
			},
		});
		map.addInteraction(draw);
		draw.on('drawend', function (event) {
			callback(event);
			map.removeInteraction(draw);
		});
	},
	/**
	 * [사용]피처 삭제
	 */
	deleteFeature: function (layerId, featureId) {
		if (!layerId || !featureId) return;
		let layer = this.getLayerById(layerId);
		if (layer != null) {
			let feature = layer.getSource().getFeatureById(featureId);
			if (feature != null) {
				layer.getSource().removeFeature(feature);
			}
		}
	},
	/**
	 * [사용]레이어
	 */
	fitExtent: function (extent, zoom) {
		let map = this.map;
		let mapSize = map.getSize();
		if (!zoom) {
			zoom = this.getZoom();
		}
		if (extent) {
			map.getView().fit(extent, { size: [mapSize[0], mapSize[1]] });
		}
		this.setZoom(zoom);
	},
	getGeomLineOfFeature: function (feature) {
		if (!feature) {
			return;
		}
		let geometry = feature.getGeometry();
		let type = geometry.getType();
		if (!(type == 'LineString' || type == 'MultiLineString')) {
			return;
		}
		let geomLienString = geometry;
		if (type != 'LineString') {
			//lienString = geometry.getLineString();
		}
		return geomLienString;
	},
	getCenterGeomLineOfFeature: function (feature) {
		if (!feature) {
			return;
		}
		let center = [];
		let geomLienString = this.getGeomLineOfFeature(feature);
		let coords = geomLienString.getCoordinates();
		let coordCnt = coords.length;
		if (coordCnt == 1) {
			coords = coords[0];
		}
		//라인 한개
		if (coordCnt == 2) {
			return geomLienString;
		}
		//멀티라인
		let centerCnt = Math.floor(coordCnt / 2);
		let lineCoordinates = [];
		lineCoordinates.push(coords[centerCnt - 1]);
		lineCoordinates.push(coords[centerCnt]);
		geomLienString = new LinearRing(lineCoordinates);
		return geomLienString;
	},
	getCenterOfLineGeom: function (geom) {
		let center = [];
		let extent = geom.getExtent();
		let x = extent[0] + (extent[2] - extent[0]) / 2;
		let y = extent[1] + (extent[3] - extent[1]) / 2;
		center.push(x);
		center.push(y);
		return center;
	},
	/**
	 * 1 -> 01 두자리수로 변환
	 */
	fillZeroToZoomLevel: function (n, digits) {
		let zero = '';
		n = n.toString();
		if (digits > n.length) {
			for (let i = 0; digits - n.length > i; i++) {
				zero += '0';
			}
		}
		return zero + n;
	},
	convertGeoJsonToFeature: function (data, dataProjection) {
		let format = new GeoSJON();
		let feature = format.readFeature(data, {
			dataProjection: dataProjection || GisApp.TO_DATA_PROJ,
			featureProjection: GisApp.TO_PROJ,
		});
		return feature;
	},
	convertGeoJsonToFeatures: function (data, dataProjection) {
		let format = new GeoSJON();
		const features = [];
		for (let obj of data) {
			let feature = null;
			try {
				feature = format.readFeature(obj, {
					dataProjection: dataProjection || GisApp.TO_DATA_PROJ,
					featureProjection: GisApp.TO_PROJ,
				});
			} catch (error) {
				console.log(obj);
			}
			features.push(feature);
		}
		return features;
	},

	/**
	 * [사용]WKT포맷 Geometry로 feature 생성
	 */
	convertWktToFeature: function (wtkGeom, dataProjection) {
		let format = new WKT();
		let feature = format.readFeature(wtkGeom, {
			dataProjection: dataProjection || GisApp.TO_DATA_PROJ,
			featureProjection: GisApp.TO_PROJ,
		});
		return feature;
	},

	/**
	 * [사용]geometry를 WKT포맷으로 변경
	 */
	convertGeomToWkt: function (geometry) {
		let format = new WKT();
		let wktGeom = format.writeGeometry(geometry, {
			dataProjection: GisApp.TO_DATA_PROJ,
			featureProjection: GisApp.TO_PROJ,
		});
		return wktGeom;
	},
	/**
	 * [사용]레이어 전체 표시 컨트롤
	 */
	setAllLayersOnMap: function (visible) {
		this.map.getLayers().forEach(function (el) {
			if (el !== null && el.get('id') !== null) {
				let layerId = el.get('id');
				if ('emap' !== layerId && 'satellite' !== layerId && 'minimap-base' !== layerId) {
					el.setVisible(visible);
				}
			}
		});
	},
};

/**
 * [사용]피처 레이어 검색
 */
Feature.prototype.getLayer = function () {
	let map = GisApp.Module.core.map;
	let this_ = this,
		layer_;
	let sameFeature = function (feature) {
		return this_ === feature ? true : false;
	};
	map.getLayers().forEach(function (layer) {
		let source = layer.getSource();
		if (source instanceof VectorSource) {
			let features = source.getFeatures();
			if (features.length > 0) {
				let found = features.some(sameFeature);
				if (found) {
					layer_ = layer;
				}
			}
		}
	});
	return layer_;
};

export default GisApp;
