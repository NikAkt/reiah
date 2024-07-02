import { Loader } from "@googlemaps/js-api-loader";
import { store } from "../data/stores";
import { createEffect, createSignal, onMount, Show, Suspense } from "solid-js";

export const DashboardInfo = (props) => {
  let ref;
  const [zipcode, setZipcode] = createSignal(11385);

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385
  const fetchDashboardInfoData = async (level, area) => {
    console.log("fetching data for dashboard");
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
          let amenities = {};
          data.forEach();
        }
      });
  };

  fetchDashboardInfoData("zipcode", 11385);

  return (
    <div>
      <div>
        <p>
          Borough <span id="borough-dashboardInfo"></span>
        </p>
        <p>
          Neighbourhood <span id="neighbourhood-dashboardInfo"></span>
        </p>
      </div>
      <div>
        <p>Real estate information</p>
        <ul>
          <li>
            Average Home Value <span id="avgHomeValue-dashboardInfo"></span>
          </li>
          <li>
            Median Home Income <span id="medianHomeIncome-dashboardInfo"></span>
          </li>
          <li>
            Median Age <span id="medianAge-dashboardInfo"></span>
          </li>
        </ul>
      </div>
      <div>
        <p>Amenities</p>
        <div>
          <ul>Facility Type</ul>
        </div>
      </div>
    </div>
  );
};
