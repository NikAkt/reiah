import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal } from "solid-js";
import GoogleMap from "./components/GoogleMap";

import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import Filter from "./components/Filter";
import LoginRegister from "./components/LoginRegister";
import MapFilter from "./components/MapFilter";
import Markers from "./components/Markers";

export default function App() {
  let mapContainer;
  const [coords, setCoords] = createSignal({ lat: 40.7128, lng: -74.006 });
  const [neighborhood, setNeighborhood] = createSignal("");

  return (
    <Router
      root={(props) => (
        <div class="m-0 px-0 flex flex-col items-center">
          <Nav />
          {/* <Suspense>{props.children}</Suspense> */}
          {/* <LoginRegister /> */}
          <GoogleMap
            ref={mapContainer}
            lat={coords().lat}
            lng={coords().lng}
            zoom={11}
          />
          <MapFilter />
          {/* <Filter />
          <LoginRegister /> */}
          <Markers />
          {/* <Markers /> */}
        </div>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
