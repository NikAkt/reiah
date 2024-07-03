import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";
import Markers from "./Markers";

export const DashboardInfo = (props) => {
  let ref;
  const zipcode = props.getSelectedZip();
  console.log(zipcode);
  const loader = new Loader({
    apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
    version: "weekly",
  });
  let amenitiesOnMap = [];

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385
  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // {"Queens":{"West Central Queens":{"QN05":[11374,11375,11379,11385]}}}
          const keys = Object.keys(data);
          console.log(keys);
          document.getElementById("borough-dashboardInfo").innerText =
            Object.keys(data);
          document.getElementById("neighbourhood-dashboardInfo").innerText =
            Object.keys(data[keys[0]]);
        }
      });

    fetch(`http://localhost:8000/api/prices?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        //[{"zipcode":11385,"avg_home_value":797132.8645251795,"median_household_income":77350,"median_age":36.2}]
        if (data) {
          const obj = data[0];
          console.log("obj in dashboard info", obj);
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
        //[{"zipcode":11385,"avg_home_value":797132.8645251795,"median_household_income":77350,"median_age":36.2}]
        if (data) {
          loader.importLibrary("marker").then(({ Marker, Animation }) => {
            if (amenitiesOnMap) {
              amenitiesOnMap.forEach((marker) => marker.setMap(null));
              amenitiesOnMap = [];
            }

            let amenities = {};
            data.forEach((el) => {
              if (!amenities.hasOwnProperty(el["FACILITY_TYPE"])) {
                amenities[el["FACILITY_TYPE"]] = {};
              }
              if (
                !amenities[el["FACILITY_TYPE"]].hasOwnProperty(
                  el["FACILITY_DESC"]
                )
              ) {
                amenities[el["FACILITY_TYPE"]][el["FACILITY_DESC"]] = [];
              }
              amenities[el["FACILITY_TYPE"]][el["FACILITY_DESC"]].push(
                el["NAME"]
              );
              const marker = new Marker({
                position: { lat: el["LAT"], lng: el["LNG"] },
                title: el["NAME"],
                level: "amenties",
                facility_type: el["FACILITY_TYPE"],
                facility_desc: el["FACILITY_DESC"],
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
              facilityTypeUl.innerHTML += `<li><ul>${a}${facilityDesc}</ul></li>`;
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
    <div class="relative w-[100%] flex flex-col items-center justify-center h-[100%]">
      <div>
        <p>
          Borough: <span id="borough-dashboardInfo"></span>
        </p>
        <p>
          Neighbourhood: <span id="neighbourhood-dashboardInfo"></span>
        </p>
      </div>
      <div>
        <p>Real estate information</p>
        <ul>
          <li>
            Average Home Value: <span id="avgHomeValue-dashboardInfo"></span>
          </li>
          <li>
            Median Home Income:{" "}
            <span id="medianHomeIncome-dashboardInfo"></span>
          </li>
          <li>
            Median Age: <span id="medianAge-dashboardInfo"></span>
          </li>
        </ul>
      </div>
      <div>
        <div>
          <ul id="facility_type_ul">Amenities:</ul>
        </div>
      </div>
    </div>
  );
};
