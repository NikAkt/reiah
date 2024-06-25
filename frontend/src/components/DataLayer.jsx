import { setLayerStore, layerStore } from "./layerStore";
import { createEffect } from "solid-js";

const insertDataLayer = (cdtaArray, data, map, borough_geojson, props) => {
  //filter the data layer geojson
  const all_neighborhood = data.features.filter((obj) =>
    cdtaArray.includes(obj.properties["cdta2020"])
  );
  data.features = all_neighborhood;
  try {
    map.data.addGeoJson(borough_geojson);
    map.data.setStyle(function (feature) {
      const geometryType = feature.getGeometry().getType();
      let color = "#81c7a5";
      if (feature.getProperty("isColorful")) {
        color = feature.getProperty("color");
      }
      if (geometryType === "MultiPolygon") {
        return {
          strokeColor: "green",
          fillColor: color,
          strokeWeight: 2,
          fillOpacity: 0.3,
          clickable: true,
        };
      }
    });
    setLayerStore("dataLayer", true);
    map.data.addListener("click", function (event) {
      event.feature.setProperty("isColorful", true);
    });
    map.data.addListener("mouseover", function (event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, { strokeWeight: 3 });
      event.feature.setProperty("isColorful", true);

      props.setInfoWindowContent(`${layerStore.map.zoom}`);
    });

    map.data.addListener("mouseout", function (event) {
      event.feature.setProperty("isColorful", false);
      map.data.revertStyle();
    });
  } catch (error) {
    console.log(error);
  }
};

const DataLayer = (props) => {
  //initialise the data needed
  const map = layerStore.map;
  const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);
  const borough_geojson = JSON.parse(props.borough_geojson);
  const cdta = [];
  const data = JSON.parse(props.data);

  //data processing
  for (const borough in borough_neighbourhood) {
    for (const neighbourhood in borough_neighbourhood[borough]) {
      for (const cdtaCode in borough_neighbourhood[borough][neighbourhood]) {
        cdta.push(cdtaCode);
      }
    }
  }

  //should clean the existing data layer is duplicated

  try {
    if (map.zoom <= 11) {
      //data layer is default to be borough level
      insertDataLayer(cdta, data, map, borough_geojson, props);
    } else if (map.zoom <= 13 && map.zoom >= 12) {
      //datalayer changed to neighbourhood level
    } else {
      //datalayer changed to zip code level
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};
export default DataLayer;
