/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./pages/Dashboard";
import { HomePage } from "./pages/HomePage";
import { Settings } from "./pages/Settings";
import { Map } from "./pages/Map";
import "./index.css";
import { store, setStore } from "./data/stores";
import { ColChart } from "./components/ColChart";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

const fetchGeoJSON = async () => {
  const response = await fetch("http://localhost:8000/api/neighbourhoods");
  if (!response.ok) {
    throw new Error("Could not fetch GeoJSON: " + response.statusText);
  }
  try {
    const geojson = await response.json();
    return geojson;
  } catch (e) {
    console.error(e);
  }
};

fetchGeoJSON().then((v) => setStore({ ...store, geoJSONData: v })); //TODO: I am sure there is a more solid way of doing this with createResource but this worked

function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>{props.children}</div>
  );
}

render(
  () => (
    <Router root={App}>
      <Route path="/" component={HomePage} />
      <Route path="/settings" component={Settings} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/map" component={Map} />
      <Route path="/colchart" component={ColChart} />
    </Router>
  ),
  root
);
