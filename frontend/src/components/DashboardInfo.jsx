import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import Markers from "./Markers";
import { DoughnutChart } from "./Charts";

export const DashboardInfo = (props) => {
  let ref;
  const loader = new Loader({
    apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
    version: "weekly",
  });
  const [amenitiesOnMap, setAmenitiesOnMap] = createSignal([]);
  const [amenities, setAmenities] = createSignal({});
  const [show, setShow] = createSignal(true);

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385
  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // [{"neighbourhood":"West Central Queens","borough":"Queens","zipcodes":[11374,11375,11379,11385]}]
          const obj = data[0];
          document.getElementById(
            `borough-dashboardInfo-${props.zip}`
          ).innerText = obj["borough"];
          document.getElementById(
            `neighbourhood-dashboardInfo-${props.zip}`
          ).innerText = obj["neighbourhood"];
        }
      });

    fetch(`http://localhost:8000/api/prices?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        //[{"zipcode":11385,"avg_home_value":797132.8645251795,"median_household_income":77350,"median_age":36.2}]
        if (data) {
          const obj = data[0];
          document.getElementById(
            `avgHomeValue-dashboardInfo-${props.zip}`
          ).innerText = obj["avg_home_value"];
          document.getElementById(
            `medianHomeIncome-dashboardInfo-${props.zip}`
          ).innerText = obj["median_household_income"];
          document.getElementById(
            `medianAge-dashboardInfo-${props.zip}`
          ).innerText = obj["median_age"];
        }
      });
    fetch(`http://localhost:8000/api/amenities?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          loader.importLibrary("marker").then(({ Marker, Animation }) => {
            if (amenitiesOnMap()) {
              amenitiesOnMap().forEach((marker) => marker.setMap(null));
              setAmenitiesOnMap([]);
            }

            let amenitiesObj = {};

            data[area].forEach((el) => {
              if (!amenitiesObj.hasOwnProperty(el["FACILITY_T"])) {
                amenitiesObj[el["FACILITY_T"]] = {};
              }
              if (
                !amenitiesObj[el["FACILITY_T"]].hasOwnProperty(
                  el["FACILITY_DOMAIN_NAME"]
                )
              ) {
                amenitiesObj[el["FACILITY_T"]][el["FACILITY_DOMAIN_NAME"]] = [];
              }
              amenitiesObj[el["FACILITY_T"]][el["FACILITY_DOMAIN_NAME"]].push(
                el["NAME"]
              );
              const marker = new Marker({
                position: { lat: el["LAT"], lng: el["LNG"] },
                title: el["NAME"],
                level: "amenties",
                facility_type: el["FACILITY_T"],
                facility_desc: el["FACILITY_DOMAIN_NAME"],
                animation: Animation.DROP,
                map: props.map(),
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5, // Adjust the scale to make the circle smaller or larger
                  fillColor: "#0145ac", // Circle color
                  fillOpacity: 1, // Circle fill opacity
                  strokeWeight: 1, // Circle border thickness
                  strokeColor: "#000000", // Circle border color
                },
              });
              setAmenitiesOnMap((prev) => [...prev, marker]);
            });
            setAmenities(amenitiesObj);

            // const facilityTypeUl = document.getElementById("facility_type_ul");
            // if (facilityTypeUl) {
            //   Object.keys(amenities()).forEach((a) => {
            //     const facilityDesc = Object.keys(amenities()[a])
            //       .map((el) => `<li>${el}</li>`)
            //       .join("");

            //     facilityTypeUl.innerHTML += `<li><div class=" rounded-lg text-white">${a}</div><ul>${facilityDesc}</ul></li>`;
            //   });
            // }
          });
        }
      });
  };

  createEffect(() => {
    if (props.zip !== "") {
      fetchDashboardInfoData("zipcode", props.zip);
    }
  });

  onCleanup(() => {
    const markers = amenitiesOnMap();
    if (markers) {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      setAmenitiesOnMap([]);
    }
  });

  return (
    <div
      class="w-[100%] rounded-lg
    h-[100%] border-2 border-teal-500 border-solid overflow-y-auto"
      id={`dashboardDiv-${[props.zip]}`}
    >
      <div
        class="col-span-2 text-center justify-center 
        cursor-pointer
        bg-teal-500 text-white"
        onClick={() => {
          setShow((prev) => !prev);
        }}
      >
        ZIPCODE {props.zip}
      </div>
      <div
        class={`flex flex-row relative 
      w-[100%] place-content-stretch
       ${show() ? "" : "hidden"}`}
      >
        <div class="basic-info w-[50%]">
          <div
            class="bg-teal-500 text-white items-center
           text-center justify-center items-center"
          >
            Basic Information
          </div>
          <div class="grid grid-cols-1 divide-y gap-2">
            <p>LOCATION</p>
            <div class="w-[100%] px-2 ">
              <div>Borough: </div>
              <div id={`borough-dashboardInfo-${props.zip}`}></div>
            </div>
            <p>
              <span>Neighbourhood: </span>
              <span id={`neighbourhood-dashboardInfo-${props.zip}`}></span>
            </p>
            <p>
              <span class="rounded-lg">REAL ESTATE INFORMATION</span>
            </p>
            <div class="grid grid-cols-1 divide-y">
              <div>
                <span>Average Home Value: </span>
                <span id={`avgHomeValue-dashboardInfo-${props.zip}`}></span>
              </div>
              <div>
                <span>Median Home Income: </span>
                <span id={`medianHomeIncome-dashboardInfo-${props.zip}`}></span>
              </div>
              <div>
                <span>Median Age: </span>
                <span id={`medianAge-dashboardInfo-${props.zip}`}></span>
              </div>
            </div>
          </div>
        </div>
        <div class="w-[50%] h-[40vh]">
          <Suspense>
            <Show when={amenities()}>
              <p class="bg-teal-500 text-white text-center">Amenities:</p>

              <DoughnutChart
                amenities={amenities}
                zip={props.zip}
                ref={(el) => (ref = el)}
              />
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
