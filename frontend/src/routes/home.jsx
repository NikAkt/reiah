import {
  createSignal,
  createResource,
  Switch,
  Match,
  Suspense,
} from "solid-js";
import GoogleMap from "~/components/GoogleMap";

import Nav from "~/components/Nav";
import Filter from "~/components/Filter";
import Dashboard from "~/components/Dashboard";
import InfoWindow from "~/components/Infowindow";
import PropertySwitchBtn from "~/components/PropertySwitchBtn";

const fetchData = async (json_path) => {
  const response = await fetch(json_path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok " + response.statusText);
    return null;
  }
  return await response.json();
};

const [infoCardData, setInfoCardData] = createSignal([]);
const [mapZoom, setMapZoom] = createSignal(10);

export default function Home() {
  let mapContainer;
  const [coords, setCoords] = createSignal({ lat: 40.7128, lng: -74.006 });
  const [showNav, setShowNav] = createSignal("inline-block");
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

  const [borough_geojson] = createResource(
    "http://localhost:3000/assets/borough.geojson",
    fetchData
  );

  const [demographic_info] = createResource(
    "http://localhost:3000/assets/demographic_data_by_zipcode.json",
    fetchData
  );

  return (
    <div class="m-0 px-0 flex flex-row">
      <Nav showNav={showNav} setShowNav={setShowNav} />
      <InfoWindow />
      <PropertySwitchBtn class="fixed top-[2vh] left-[20vw]" />
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Match
            when={
              realEstateData() &&
              historicalRealEstateData() &&
              amenitiesData() &&
              borough_neighbourhood() &&
              borough_geojson() &&
              demographic_info()
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
                borough_geojson={JSON.stringify(borough_geojson())}
                showNav={showNav}
                setInfoCardData={setInfoCardData}
                setMapZoom={setMapZoom}
                mapZoom={mapZoom}
              />
              <Filter
                realEstateData={JSON.stringify(realEstateData())}
                historicalRealEstateData={JSON.stringify(
                  historicalRealEstateData()
                )}
                amenitiesData={JSON.stringify(amenitiesData())}
              />

              <Dashboard
                infoCardData={infoCardData}
                setInfoCardData={setInfoCardData}
                demographic_info={demographic_info()}
                amenitiesData={amenitiesData()}
              />
            </>
          </Match>
          <Match when={realEstateData.error}>
            <div>error loading real estate data..</div>
          </Match>
          <Match when={historicalRealEstateData.error}>
            <div>error loading historic real estate data..</div>
          </Match>
          <Match when={amenitiesData.error}>
            <div>error loading amenities data..</div>
          </Match>
          <Match when={datalayer_geonjson.error}>
            <div>error loading datalayer geojson data..</div>
          </Match>
        </Switch>
      </Suspense>
    </div>
  );
}
