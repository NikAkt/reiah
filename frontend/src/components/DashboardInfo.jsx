import { Loader } from "@googlemaps/js-api-loader";
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import Markers from "./Markers";
import { DoughnutChart, BarChart } from "./Charts";

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
  const [getPropertyPrice, setPropertyPrice] = createSignal([]);
  const [getPricePerSQFT, setPricePerSQFT] = createSignal([]);
  const [getPropertySQFT, setPropertySQFT] = createSignal([]);
  const [propertyOnMap, setPropertyOnMap] = createSignal([]);
  const [getPropertyType, setPropertyType] = createSignal([]);

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

    fetch(`http://localhost:8000/api/property-data?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          let type = {};
          let price = [];
          let price_per_sqft = [];
          let propertysqft = [];
          let labels = [];
          data[area].forEach((el) => {
            if (!type.hasOwnProperty(el.TYPE)) {
              type[el.TYPE] = 0;
            }
            type[el.TYPE] += 1;
            price.push(el.PRICE);
            price_per_sqft.push(el["PRICE_PER_SQFT"]);
            propertysqft.push(el["PROPERTYSQFT"]);
            labels.push(el["TYPE"]);
          });

          const priceDatasets = {
            labels: labels,
            datasets: [{ label: "Property Price", data: price }],
          };
          setPropertyPrice(priceDatasets);

          const datasets = {
            labels: Object.keys(type),
            datasets: [{ label: "Property Type", data: Object.values(type) }],
          };
          setPropertyType(datasets);

          loader.importLibrary("marker").then(({ Marker, Animation }) => {
            if (propertyOnMap()) {
              propertyOnMap().forEach((marker) => marker.setMap(null));
              setPropertyOnMap([]);
            }

            data[area].forEach((el) => {
              const marker = new Marker({
                position: { lat: el["LATITUDE"], lng: el["LONGITUDE"] },
                level: "property-data",
                type: el["TYPE"],
                bath: el["BATH"],
                beds: el["BEDS"],
                price: el["PRICE"],
                propertysqf: ["PROPERTYSQFT"],
                animation: Animation.DROP,
                map: props.map(),
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 5, // Adjust the scale to make the circle smaller or larger
                  fillColor: "#ffffff", // Circle color
                  fillOpacity: 1, // Circle fill opacity
                  strokeWeight: 1, // Circle border thickness
                  strokeColor: "#000000", // Circle border color
                },
              });
              setPropertyOnMap((prev) => [...prev, marker]);
              marker.addListener("click", () => {
                console.log("marker got clicked");
              });
            });
          });
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
        class={`flex flex-col relative 
      w-[100%] place-content-stretch
       ${show() ? "" : "hidden"}`}
      >
        <div>
          <div>Real Estate Information</div>
          <div class="flex flex-row">
            {" "}
            <Show when={getPropertyPrice()}>
              {/* <BarChart datasets={getPropertyPrice()} /> */}
              <div>Visualisation of Price Information</div>
            </Show>
            <Show when={getPropertyType()}>
              <div>
                <DoughnutChart datasets={getPropertyType()} />
              </div>
            </Show>
          </div>
        </div>
        <div>
          <div class="basic-info ">
            <div
              class="bg-teal-500 text-white items-center
           text-center justify-center items-center"
            >
              Demographic Information
            </div>
            <div class="grid grid-cols-1 divide-y gap-2">
              <div class="grid grid-cols-1 divide-y">
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
                  Median Household Income{" "}
                  <span id="medianHouseholdIncome"></span>
                </div>
                <div class="grid grid-cols-2">
                  <div>
                    <Suspense>
                      <Show when={gender()}>
                        <p class="bg-teal-500 text-white text-center">
                          Gender:
                        </p>

                        <DoughnutChart
                          datasets={gender()}
                          zip={props.zip}
                          ref={(el) => (ref = el)}
                        />
                      </Show>
                    </Suspense>
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
                  </div>{" "}
                </div>
              </div>
            </div>
          </div>
          <div>
            <Suspense>
              <Show when={amenities()}>
                <p class="bg-teal-500 text-white text-center">Amenities:</p>
                <div class="flex flex-row">
                  <DoughnutChart
                    datasets={amenities()}
                    zip={props.zip}
                    ref={(el) => (ref = el)}
                  />
                  <div>Details</div>
                </div>
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};
