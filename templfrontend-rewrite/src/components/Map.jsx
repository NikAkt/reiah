import { Loader } from "@googlemaps/js-api-loader";
import { store, setStore } from "../data/stores";
import { createEffect, createSignal, onMount } from "solid-js";
import Chart from "chart.js/auto";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

async function extractHistoricTSData(level, title) {
  let tsData = null;
  if (level === "zipcode") {
    try {
      fetch(`http://localhost:8000/api/historic-prices?zipcode=${title}`)
        .then((response) => response.json())
        .then((data) => (tsData = data["history"]));
    } catch (error) {
      console.log(
        `${level}-${title} may have no data for historical prices:${error}`
      );
    }
  } else if (level === "borough") {
    try {
      fetch(`http://localhost:8000/api/historic-prices?borough=${title}`)
        .then((response) => response.json())
        .then((data) => {
          tsData = {};
          data.forEach((obj) => {
            const historicalPrices = obj["history"];
            for (let key of Object.keys(historicalPrices)) {
              if (!tsData.hasOwnProperty(key)) {
                tsData[key] = 0;
              }

              tsData[key] += historicalPrices[key] * 1;
            }
          });
          for (let key of Object.keys(tsData)) {
            tsData[key] = (tsData[key] / data.length).toFixed(2);
          }
        });
    } catch (error) {
      console.log(
        `${level}-${title} may have no data for historical prices:${error}`
      );
    }
  } else if (level === "neighbourhood") return tsData;
}

const insertDataLayer = (data, map) => {
  try {
    map.data.addGeoJson(data);
    map.data.setStyle(function (feature) {
      const geometryType = feature.getGeometry().getType();
      let color = "#10b981";
      if (feature.getProperty("isColorful")) {
        color = feature.getProperty("color");
      }
      if (geometryType === "MultiPolygon") {
        return {
          strokeColor: "#10b981",
          fillColor: color,
          strokeWeight: 2,
          fillOpacity: 0.1,
          clickable: true,
        };
      }
    });
    map.data.addListener("click", function (event) {
      event.feature.setProperty("isColorful", true);
    });
    map.data.addListener("mouseover", function (event) {
      map.data.revertStyle();
      map.data.overrideStyle(event.feature, { strokeWeight: 3 });
      event.feature.setProperty("isColorful", true);
    });

    map.data.addListener("mouseout", function (event) {
      event.feature.setProperty("isColorful", false);
      map.data.revertStyle();
    });
  } catch (error) {
    console.log("error in loading data layer", error);
  }
};

const clearDataLayer = (map) => {
  map.data.forEach(function (feature) {
    map.data.remove(feature);
  });
};

const [borough, setBorough] = createSignal(false);
const [neighbourhood, setNeighbourhood] = createSignal(false);

export const MapComponent = (props) => {
  let ref;
  const [mapObject, setMapObject] = createSignal(null);
  const mapOptions = JSON.parse(JSON.stringify(store.mapOptions));
  const borough_geojson = props.dataResources.borough_geojson();
  const neighbourhood_geojson = props.dataResources.neighbourhood_geojson();

  onMount(() => {
    loader
      .importLibrary("maps")
      .then(({ Map }) => {
        setMapObject(new Map(ref, mapOptions));
        // mapObject().data.addGeoJson(store.geoJSONData);
        mapObject().addListener("zoom_changed", () => {
          props.setMapZoom(mapObject().zoom);
        });
        insertDataLayer(neighbourhood_geojson, mapObject());
        setStore({ ...store, storeKey: mapObject() });
      })
      .catch((e) => {
        console.error(e);
      });
  });

  createEffect(() => {
    if (mapObject() !== null) {
      mapObject().setOptions({
        styles: store.mapStyles[store.darkModeOn ? "dark" : "light"],
      });
      mapObject().data.setStyle({
        fillColor: store.darkModeOn ? "white" : "dark",
        strokeWeight: 1,
      });
    }
  });

  createEffect(() => {
    try {
      if (props.mapZoom() <= 10) {
        //if it has neighbourhood datalayer, clear the data layer
        if (neighbourhood()) {
          clearDataLayer(mapObject());
          setNeighbourhood(false);
        }
        //if not duplicated, insert the borough data layer
        if (!borough()) {
          insertDataLayer(borough_geojson, mapObject());
          setBorough(true);
        }
      } else {
        //datalayer changed to neighbourhood level
        if (borough()) {
          clearDataLayer(mapObject());
          setBorough(false);
        }
        //if not duplicated, insert the borough data layer
        if (!neighbourhood()) {
          insertDataLayer(neighbourhood_geojson, mapObject());
          setNeighbourhood(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  return <div ref={ref} id="map" class="h-full basis-2/5 grow"></div>;
};
