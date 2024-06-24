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
import InfoWindow from "~/components/Infowindow";

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
    "http://localhost:8000/api/neighbourhoods",
    fetchData
  );

  const [borough_neighbourhood] = createResource(
    "http://localhost:3000/assets/borough_neighbourhood.json",
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
              realEstateData() &&
              historicalRealEstateData() &&
              amenitiesData() &&
              borough_neighbourhood()
            }
          >
            <>
              <GoogleMap
                ref={(el) => (mapContainer = el)}
                lat={coords().lat}
                lng={coords().lng}
                zoom={10}
                realEstateData={JSON.stringify(realEstateData())}
                historicalRealEstateData={JSON.stringify(
                  historicalRealEstateData()
                )}
                datalayer_geonjson={JSON.stringify(datalayer_geonjson())}
                borough_neighbourhood={JSON.stringify(borough_neighbourhood())}
                us_zip_codes={JSON.stringify(us_zip_codes())}
              />
              <Filter
                realEstateData={JSON.stringify(realEstateData())}
                historicalRealEstateData={JSON.stringify(
                  historicalRealEstateData()
                )}
                amenitiesData={JSON.stringify(amenitiesData())}
              />
              <Dashboard dataToShow={JSON.stringify(borough_neighbourhood())} />
            </>
          </Match>
          <Match when={realEstateData.error || historicalRealEstateData.error}>
            <div>error loading something..</div>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}
