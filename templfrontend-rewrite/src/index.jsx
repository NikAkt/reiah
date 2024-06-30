/* @refresh reload */
import { render } from "solid-js/web";
import { Show, Suspense, createResource } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./pages/Dashboard";
import { HomePage } from "./pages/HomePage";
import { Settings } from "./pages/Settings";
import { Map } from "./pages/Map";
import "./index.css";
import { store, setStore } from "./data/stores";
import Markers from "./components/Markers";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

// const fetchGeoJSON = async () => {
//   const response = await fetch("http://localhost:8000/api/neighbourhoods");
//   if (!response.ok) {
//     throw new Error("Could not fetch GeoJSON: " + response.statusText);
//   }
//   try {
//     const geojson = await response.json();
//     return geojson;
//   } catch (e) {
//     console.error(e);
//   }
// };

// fetchGeoJSON().then((v) => setStore({ ...store, geoJSONData: v }));
//TODO: I am sure there is a more solid way of doing this with createResource but this worked
const fetchData = async ([json_path, storeKey]) => {
  const response = await fetch(json_path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  try {
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(`${storeKey} not succeed in fetching data: ${e}`);
    return null;
  }
};

// const [realEstateData] = createResource(
//   ["http://localhost:8000/api/prices", "realEstateData"],
//   fetchData
// );
console.log("start fetching data");
const [historicalRealEstateData] = createResource(
  ["http://localhost:8000/api/historic-prices", "historicalRealEstateData"],
  fetchData
);

const [amenitiesData] = createResource(
  ["http://localhost:8000/api/amenities", "amenitiesdata"],
  fetchData
);

const [zipcodes] = createResource(
  ["http://localhost:8000/api/zipcodes", "us_zipcodes"],
  fetchData
);

const [borough_geojson] = createResource(
  ["http://localhost:8000/api/borough", "borough_geojson"],
  fetchData
);

const [neighbourhood_geojson] = createResource(
  ["http://localhost:8000/api/neighbourhoods", "neighbourhood_geojson"],
  fetchData
);

const dataResources = {
  historicalRealEstateData,
  amenitiesData,
  zipcodes,
  borough_geojson,
  neighbourhood_geojson,
};

function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>{props.children}</div>

    // </DataResourcesContext.Provider>
  );
}

render(
  () => (
    <Router root={App}>
      <Route
        path="/"
        component={() => <HomePage dataResources={dataResources} />}
      />
      <Route path="/settings" component={Settings} />
      <Route path="/dashboard" component={Dashboard} />
      <Route
        path="/map"
        component={() => <Map dataResources={dataResources} />}
      />
      <Route
        path="/develop"
        component={() => <Markers dataResources={dataResources} />}
      />
    </Router>
  ),
  root
);
