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
  const [race, setRace] = createSignal({});
  const [gender, setGender] = createSignal({});

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

    fetch(`http://localhost:8000/api/demographic?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        //[{"zipcode":11385,"avg_home_value":797132.8645251795,"median_household_income":77350,"median_age":36.2}]
        if (data) {
          const obj = data[0];

          const gender_labels = ["Male", "Female"];
          const gender_data = [obj["Male"], obj["Female"]];

          const gender_datasets = {
            labels: gender_labels,
            datasets: [{ label: "Gender", data: gender_data }],
          };
          setGender(gender_datasets);

          const race_labels = [
            "white",
            "asian",
            "black",
            "pacific_islander",
            "american_indian",
            "other",
          ];
          const race_data = [
            obj["white"],
            obj["asian"],
            obj["black"],
            obj["pacific_islander"],
            obj["american_indian"],
            obj["other"],
          ];

          const race_datasets = {
            labels: race_labels,
            datasets: [{ label: "Diversity", data: race_data }],
          };

          setRace(race_datasets);
          console.log("demographic info", obj);
          document.getElementById("familyHousehold").innerText =
            obj["FamilyHousehold"];
          document.getElementById("medianHouseholdIncome").innerText =
            obj["MedianHouseholdIncome"];
          document.getElementById("singleHousehold").innerText =
            obj["SingleHousehold"];
          document.getElementById("population").innerText = obj["Population"];
          document.getElementById("populationDensity").innerText =
            obj["PopulationDensity"];

          // document.getElementById(
          //   `avgHomeValue-dashboardInfo-${props.zip}`
          // ).innerText = obj["avg_home_value"];
          // document.getElementById(
          //   `medianHomeIncome-dashboardInfo-${props.zip}`
          // ).innerText = obj["median_household_income"];
          // document.getElementById(
          //   `medianAge-dashboardInfo-${props.zip}`
          // ).innerText = obj["median_age"];
        }
      });
    fetch(`http://localhost:8000/api/amenities?${level}=${area}`)
      .then((response) => response.json())
      .then((data_amenities) => {
        if (data_amenities) {
          loader.importLibrary("marker").then(({ Marker, Animation }) => {
            if (amenitiesOnMap()) {
              amenitiesOnMap().forEach((marker) => marker.setMap(null));
              setAmenitiesOnMap([]);
            }

            let amenitiesObj = {};

            console.log("amenities", data_amenities);

            data_amenities[area].forEach((el) => {
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

            const labels = Object.keys(amenitiesObj);
            let data = [];
            for (let key of labels) {
              const obj = amenitiesObj[key];
              let value = 0;
              // console.log("obj in creating doughnut", obj);
              for (let desc of Object.keys(obj)) {
                value += obj[desc].length;
              }
              // console.log("value in doughnutchart", value);
              data.push(value);
            }
            const datasets = {
              labels,
              datasets: [{ label: "Amenities DoughnutChart", data }],
            };
            console.log("amenities", datasets);

            setAmenities(datasets);

            const footer = (tooltipItems) => {
              const desc = Object.keys(amenities()[tooltipItems[0].label]);
              let footer_string = "";
              desc.forEach((d) => {
                const arr = amenities()[tooltipItems[0].label][d];
                footer_string += `${d}:${arr.length}\n`;
              });
              return footer_string;
            };

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
        id="dashboard-title"
        onClick={() => {
          setShow((prev) => !prev);
        }}
      >
        ZIPCODE {props.zip},
        <span id={`neighbourhood-dashboardInfo-${props.zip}`}></span>,
        <span id={`borough-dashboardInfo-${props.zip}`}></span>
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
            Demographic Information
          </div>
          <div class="grid grid-cols-1 divide-y gap-2">
            <div class="grid grid-cols-1 divide-y">
              {/* <div>
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
              </div> */}
              <div>
                Family Household <span id="familyHousehold"></span>
              </div>
              <div>
                Single Household <span id="singleHousehold"></span>
              </div>
              <div>
                Population <span id="population"></span>
              </div>
              <div>
                Population Density <span id="populationDensity"></span>
              </div>
              <div>
                Median Household Income <span id="medianHouseholdIncome"></span>
              </div>
              <div>
                <div>
                  <Suspense>
                    <Show when={gender()}>
                      <p class="bg-teal-500 text-white text-center">Gender:</p>

                      <DoughnutChart
                        datasets={gender()}
                        zip={props.zip}
                        ref={(el) => (ref = el)}
                      />
                    </Show>
                  </Suspense>
                </div>
              </div>
              <div>
                <div>
                  <Suspense>
                    <Show when={race()}>
                      <p class="bg-teal-500 text-white text-center">
                        Race Diveristy
                      </p>

                      <DoughnutChart
                        datasets={race()}
                        zip={props.zip}
                        ref={(el) => (ref = el)}
                      />
                    </Show>
                  </Suspense>
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </div>
        <div class="w-[50%] h-[40vh]">
          <Suspense>
            <Show when={amenities()}>
              <p class="bg-teal-500 text-white text-center">Amenities:</p>

              <DoughnutChart
                datasets={amenities()}
                zip={props.zip}
                ref={(el) => (ref = el)}
              />
              <div></div>
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
