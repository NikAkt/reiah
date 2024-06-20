import { A } from "@solidjs/router";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import {
  createSignal,
  createResource,
  Switch,
  Match,
  Suspense,
  createEffect,
} from "solid-js";
import GoogleMap from "~/components/GoogleMap";

import Nav from "~/components/Nav";
import Filter from "~/components/Filter";

import Dashboard from "~/components/Dashboard";

const fetchData = async (json_path) => {
  const response = await fetch(`http://localhost:3000/assets/${json_path}`);
  return await response.json();
};

export default function Home() {
  let mapContainer;
  const [coords, setCoords] = createSignal({ lat: 40.7128, lng: -74.006 });
  const [neighborhood, setNeighborhood] = createSignal("");
  const [realEstateData] = createResource(
    "real_estate_price_data.json",
    fetchData
  );
  const [historicalRealEstateData] = createResource(
    "historic_real_estate_prices.json",
    fetchData
  );

  const [amenitiesData] = createResource(
    "cleaned_amenities_data2.json",
    fetchData
  );

  return (
    <div class="m-0 px-0 flex flex-col">
      <Nav />
      {/* <Suspense>{props.children}</Suspense> */}
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Match
            when={
              realEstateData() && historicalRealEstateData() && amenitiesData()
            }
          >
            <>
              <GoogleMap
                ref={mapContainer}
                lat={coords().lat}
                lng={coords().lng}
                zoom={10}
                realEstateData={JSON.stringify(realEstateData())}
                historicalRealEstateData={JSON.stringify(
                  historicalRealEstateData()
                )}
              />
              <Filter
                realEstateData={JSON.stringify(realEstateData())}
                historicalRealEstateData={JSON.stringify(
                  historicalRealEstateData()
                )}
                amenitiesData={JSON.stringify(amenitiesData())}
              />
              <Dashboard />
            </>
          </Match>
          <Match when={realEstateData.error || historicalRealEstateData.error}>
            <div>{error()}</div>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}
