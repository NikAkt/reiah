/* @refresh reload */
import { render } from "solid-js/web";
import { Show, Suspense, createResource } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Map } from "./pages/Map";
import { RegisterPage, LoginPage } from "./pages/Auth";
import "./index.css";
import { store, setStore } from "./data/stores";
import { ErrorPage } from "./components/ErrorPage";
import { DoughnutChart } from "./components/Charts";

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

const [realEstateData] = createResource(
  ["http://localhost:8000/api/prices"],
  fetchData
);

const [historicalRealEstateData] = createResource(
  ["http://localhost:8000/api/historic-prices"],
  fetchData
);

const [amenitiesData] = createResource(
  ["http://localhost:8000/api/amenities"],
  fetchData
);

const [zipcodes] = createResource(
  ["http://localhost:8000/api/zipcodes"],
  fetchData
);

const [borough_geojson] = createResource(
  ["http://localhost:8000/api/borough"],
  fetchData
);

const [neighbourhood_geojson] = createResource(
  ["http://localhost:8000/api/neighbourhoods"],
  fetchData
);

const [borough_neighbourhood] = createResource(
  ["http://localhost:8000/api/borough-neighbourhood"],
  fetchData
);

const dataResources = {
  realEstateData,
  historicalRealEstateData,
  amenitiesData,
  zipcodes,
  borough_geojson,
  neighbourhood_geojson,
  borough_neighbourhood,
};

function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>{props.children}</div>
  );
}

render(
  () => (
    <Router root={App}>
      <Route
        path="/"
        component={() => <Home dataResources={dataResources} />}
      />
      <Route path="/settings" component={Settings} />
      <Route path="/dashboard" component={Dashboard} />
      <Route
        path="/map"
        component={() => <Map dataResources={dataResources} />}
      />
      <Route path="/register" component={RegisterPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/error" component={ErrorPage} />
      <Route path="/develop" component={DoughnutChart} />
    </Router>
  ),
  root
);
