import { Loader } from "@googlemaps/js-api-loader";
import { store, setStore } from "../data/stores";
import { createEffect, createSignal, onMount } from "solid-js";

const loader = new Loader({
  apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
  version: "weekly",
});

const insertDataLayer = (data, map) => {
  try {
    map.data.addGeoJson(data);
    map.data.setStyle(function (feature) {
      const geometryType = feature.getGeometry().getType();
      let color = "#81c";
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
