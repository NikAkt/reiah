/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import { createEffect, createResource, createSignal } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { Map } from "./pages/Map";
import { RegisterPage, LoginPage } from "./pages/Auth";
import { store } from "./data/stores";
import { ErrorPage } from "./components/ErrorPage";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "solid-supabase";
import { RouteGuard } from "./routeguard";
import RecommendZipcode from "./components/RecommendZipcode";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

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

const [favorite, setFavorite] = createSignal([]);
const [mapObject, setMapObject] = createSignal(null);

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

const [zipcode_geojson] = createResource(
  ["http://localhost:8000/api/zipcode-areas"],
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
  zipcode_geojson,
};

function App(props) {
  return (
    <div data-mode={store.darkModeOn ? "dark" : "light"}>{props.children}</div>
  );
}

createEffect(() => {
  console.log(favorite());
});

render(
  () => (
    <SupabaseProvider client={supabase}>
      <Router root={App}>
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} setFavorite={favorite} />
        <Route path="/error" component={ErrorPage} />
        <Route path="/" component={() => <Home />} />
        <Route component={RouteGuard}>
          <Route
            path="/map"
            component={() => (
              <Map
                dataResources={dataResources}
                setFavorite={setFavorite}
                favorite={favorite}
                mapObject={mapObject}
                setMapObject={setMapObject}
              />
            )}
          />
          <Route path="/settings" component={Settings} />
          <Route path="/develop" component={RecommendZipcode} />
          <Route
            path="/dashboard"
            component={() => <Dashboard favorite={favorite} />}
          />
        </Route>
      </Router>
    </SupabaseProvider>
  ),
  root
);
