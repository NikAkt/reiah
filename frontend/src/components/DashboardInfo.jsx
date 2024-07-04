import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";
import Markers from "./Markers";
import { DoughnutChart } from "./Charts";

export const DashboardInfo = (props) => {
  let ref;
  const zipcode = props.getSelectedZip();
  console.log(zipcode);
  const loader = new Loader({
    apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
    version: "weekly",
  });
  let amenitiesOnMap = [];
  let amenities = {};

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385
  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // [{"neighbourhood":"West Central Queens","borough":"Queens","zipcodes":[11374,11375,11379,11385]}]
          const obj = data[0];
          document.getElementById("borough-dashboardInfo").innerText =
            obj["borough"];
          document.getElementById("neighbourhood-dashboardInfo").innerText =
            obj["neighbourhood"];
        }
      });

    fetch(`http://localhost:8000/api/prices?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        //[{"zipcode":11385,"avg_home_value":797132.8645251795,"median_household_income":77350,"median_age":36.2}]
        if (data) {
          const obj = data[0];
          document.getElementById("avgHomeValue-dashboardInfo").innerText =
            obj["avg_home_value"];
          document.getElementById("medianHomeIncome-dashboardInfo").innerText =
            obj["median_household_income"];
          document.getElementById("medianAge-dashboardInfo").innerText =
            obj["median_age"];
        }
      });
    fetch(`http://localhost:8000/api/amenities?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          loader.importLibrary("marker").then(({ Marker, Animation }) => {
            if (amenitiesOnMap) {
              amenitiesOnMap.forEach((marker) => marker.setMap(null));
              amenitiesOnMap = [];
            }
            if (amenities) {
              amenities = {};
            }

            data[area].forEach((el) => {
              if (!amenities.hasOwnProperty(el["FACILITY_T"])) {
                amenities[el["FACILITY_T"]] = {};
              }
              if (
                !amenities[el["FACILITY_T"]].hasOwnProperty(
                  el["FACILITY_DOMAIN_NAME"]
                )
              ) {
                amenities[el["FACILITY_T"]][el["FACILITY_DOMAIN_NAME"]] = [];
              }
              amenities[el["FACILITY_T"]][el["FACILITY_DOMAIN_NAME"]].push(
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
              amenitiesOnMap.push(marker);
            });
            const facilityTypeUl = document.getElementById("facility_type_ul");
            Object.keys(amenities).forEach((a) => {
              const facilityDesc = Object.keys(amenities[a])
                .map((el) => `<li>${el}</li>`)
                .join("");
              console.log(facilityDesc);
              facilityTypeUl.innerHTML += `<li><div class="bg-[#0145ac] rounded-lg text-white">${a}</div><ul>${facilityDesc}</ul></li>`;
            });
          });
        }
      });
  };

  createEffect(() => {
    if (props.getSelectedZip() !== "") {
      fetchDashboardInfoData("zipcode", props.getSelectedZip());
    }
  });

  return (
    <div
      class="relative w-[100%] grid divide-y-2 grid-cols-2
    items-center justify-center h-[100%] border-2 border-indigo-600 border-solid"
    >
      <div>
        <p>
          <span class="bg-[#0145ac] rounded-lg text-white">Borough: </span>
          <span id="borough-dashboardInfo"></span>
        </p>
        <p>
          <span class="bg-[#0145ac] rounded-lg text-white">
            Neighbourhood:{" "}
          </span>
          <span id="neighbourhood-dashboardInfo"></span>
        </p>
        <p>
          <span class="bg-[#0145ac] rounded-lg text-white">
            Real estate information
          </span>
        </p>
        <ul>
          <li>
            <span class="bg-[#0145ac] rounded-lg text-white">
              Average Home Value:{" "}
            </span>
            <span id="avgHomeValue-dashboardInfo"></span>
          </li>
          <li>
            <span class="bg-[#0145ac] rounded-lg text-white">
              Median Home Income:{" "}
            </span>
            <span id="medianHomeIncome-dashboardInfo"></span>
          </li>
          <li>
            <span class="bg-[#0145ac] rounded-lg text-white">Median Age: </span>
            <span id="medianAge-dashboardInfo"></span>
          </li>
        </ul>
      </div>
      <div>
        <div>
          <p class="bg-[#0145ac] rounded-lg text-white">Amenities: </p>
          <DoughnutChart amenities={amenities} />
          <ul id="facility_type_ul"></ul>
        </div>
      </div>
    </div>
  );
};
