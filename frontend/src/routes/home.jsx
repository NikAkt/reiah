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
import InfoWindow from "~/components/InfoWindow";
import Dashboard from "~/components/Dashboard";

const fetchData = async (json_path) => {
  const response = await fetch(json_path);
  return await response.json();
};

export default function Home() {
  let mapContainer;
  const [coords, setCoords] = createSignal({ lat: 40.7128, lng: -74.006 });
  const [neighborhood, setNeighborhood] = createSignal("");
  const [realEstateData] = createResource(
    "http://localhost:3000/assets/real_estate_price_data.json",
    fetchData
  );
  const [historicalRealEstateData] = createResource(
    "http://localhost:8000/api/historic-prices",
    fetchData
  );

  const [amenitiesData] = createResource(
    "http://localhost:8000/api/amenities",
    fetchData
  );

  const [us_zip_codes] = createResource(
    "http://localhost:3000/assets/us_zip_codes.json",
    fetchData
  );

  const [datalayer_geonjson] = createResource(
    "http://localhost:3000/assets/2020_Neighborhood_Tabulation_Areas(NTAs).geojson",
    fetchData
  );

  return (
    <div class="m-0 px-0 flex flex-row">
      <Nav />
      <InfoWindow />
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
                datalayer_geonjson={JSON.stringify(datalayer_geonjson())}
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
