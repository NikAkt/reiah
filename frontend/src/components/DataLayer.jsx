import { setLayerStore, layerStore } from "./layerStore";
import { createEffect, createSignal, createResource } from "solid-js";

const insertDataLayer = (data, map) => {
  //filter the data layer geojson
  // const all_neighborhood = data.features.filter((obj) =>
  //   cdtaArray.includes(obj.properties["cdta2020"])
  // );
  // data.features = all_neighborhood;
  console.log(data);
  try {
    map.data.addGeoJson(data);
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

const DataLayer = (props) => {
  //test fetching data from backend side
  const fetchData = async (json_path) => {
    const response = await fetch(json_path, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.log("Network response was not ok " + response.statusText);
    }
    return await response.json();
  };

  const [historicalRealEstateData] = createResource(
    "http://localhost:8000/api/historic-prices",
    fetchData
  );
  const fetch_from_backend_content = historicalRealEstateData()
    ? "succeed in fetching from backend"
    : "fail to fetch from backend";
  document.getElementById(
    "dashboard"
  ).innerHTML = `<p>${fetch_from_backend_content}</p>`;
  // console.log(
  //   "fetch data from client side at datalayer",
  //   historicalRealEstateData()
  // );
  //initialise the data needed
  const map = layerStore.map;
  // const borough_neighbourhood = JSON.parse(props.borough_neighbourhood);
  const borough_geojson = JSON.parse(props.borough_geojson);
  const data = JSON.parse(props.data);

  //data processing
  // for (const borough in borough_neighbourhood) {
  //   for (const neighbourhood in borough_neighbourhood[borough]) {
  //     for (const cdtaCode in borough_neighbourhood[borough][neighbourhood]) {
  //       cdta.push(cdtaCode);
  //     }
  //   }
  // }

  //signals to check whether already having the same datalayer
  const [borough, setBorough] = createSignal(false);
  const [neighbourhood, setNeighbourhood] = createSignal(false);

  //should clean the existing data layer is duplicated
  createEffect(() => {
    try {
      if (props.mapZoom() <= 10) {
        //if it has neighbourhood datalayer, clear the data layer
        if (neighbourhood()) {
          clearDataLayer(map);
          setNeighbourhood(false);
        }
        //if not duplicated, insert the borough data layer
        if (!borough()) {
          insertDataLayer(borough_geojson, map);
          setBorough(true);
        }
      } else {
        //datalayer changed to neighbourhood level
        if (borough()) {
          clearDataLayer(map);
          setBorough(false);
        }
        //if not duplicated, insert the borough data layer
        if (!neighbourhood()) {
          insertDataLayer(data, map);
          setNeighbourhood(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  return null;
};
export default DataLayer;
