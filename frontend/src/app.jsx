import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { createSignal } from "solid-js";
import GoogleMap from "./components/GoogleMap";

import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";
import Filter from "./components/Filter";
import LoginRegister from "./components/LoginRegister";

export default function App() {
  const [coords, setCoords] = createSignal({ lat: 40.7831, lng: -73.9712 });
  const [neighborhood, setNeighborhood] = createSignal("");

  return (
    <Router
      root={(props) => (
        <>
          {/* <Nav />
          <Suspense>{props.children}</Suspense> */}
          <Filter neighborhood={neighborhood()} />
          <LoginRegister />

          <GoogleMap lat={coords().lat} lng={coords().lng} zoom={12} />
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
