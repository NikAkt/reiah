import { Loader } from "@googlemaps/js-api-loader";
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
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
  // const [getPropertyPrice, setPropertyPrice] = createSignal([]);
  const [propertyOnMap, setPropertyOnMap] = createSignal([]);
  const [getPropertyType, setPropertyType] = createSignal([]);
  const [hoverType, setHoverType] = createSignal("");
  const [typeAvg, setTypeAvg] = createSignal([]);

  const colorsChartjs = [
    "#36A2EB",
    "#FF6384",
    "#FF9F40",
    "#FFCD56",
    "#4BC0C0",
    "#9966FF",
    "#C9CBCF",
  ];

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385

  function generateHouseTypeDetails(houseType, data) {
    const filterArr = data.filter((obj) => obj.TYPE === houseType);
    if (filterArr) {
      let avgPrice = 0;
      let avgSqft = 0;
      let avgPricePerSqft = 0;
      filterArr.forEach((el) => {
        avgPrice += el["PRICE"];
        avgSqft += el["PROPERTYSQFT"];
        avgPricePerSqft += el["PRICE_PER_SQFT"];
      });
      avgPrice = (avgPrice / filterArr.length).toFixed(2);
      avgPricePerSqft = (avgPricePerSqft / filterArr.length).toFixed(2);
      avgSqft = (avgSqft / filterArr.length).toFixed(2);
      return { avgPrice, avgSqft, avgPricePerSqft };
    }
    return null;
  }

  function highlighMarker(houseType) {
    if (propertyOnMap()) {
      propertyOnMap().forEach((marker) => {
        if (marker.type == houseType) {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10, // Adjust the scale to make the circle smaller or larger
            fillColor: "#ffffff", // Circle color
            fillOpacity: 1, // Circle fill opacity
            strokeWeight: 1, // Circle border thickness
            strokeColor: "#000000", // Circle border color
          });
        } else {
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5, // Adjust the scale to make the circle smaller or larger
            fillColor: "#ffffff", // Circle color
            fillOpacity: 1, // Circle fill opacity
            strokeWeight: 1, // Circle border thickness
            strokeColor: "#000000", // Circle border color
          });
        }
      });
    }
  }

  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // [{"neighbourhood":"West Central Queens","borough":"Queens","zipcodes":[11374,11375,11379,11385]}]
          const obj = data[0];
          try {
            document.getElementById(
              `borough-dashboardInfo-${props.zip}`
            ).innerText = obj["borough"];
            document.getElementById(
              `neighbourhood-dashboardInfo-${props.zip}`
            ).innerText = obj["neighbourhood"];
          } catch (error) {
            console.log(error);
          }
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
          let count = 0;
          let priceLabels = [];
          data[area].forEach((el) => {
            if (!type.hasOwnProperty(el.TYPE)) {
              type[el.TYPE] = 0;
            }
            count += 1;
            priceLabels.push(count);
            type[el.TYPE] += 1;
            price.push(el.PRICE);
            price_per_sqft.push(el["PRICE_PER_SQFT"]);
            propertysqft.push(el["PROPERTYSQFT"]);
            labels.push(el["TYPE"]);
          });

          if (typeAvg()) {
            setTypeAvg([]);
          }
          if (hoverType()) {
            setHoverType("");
          }

          Object.keys(type).forEach((t) => {
            const avg = generateHouseTypeDetails(t, data[area]);

            setTypeAvg((prev) => [...prev, { [t]: avg }]);
          });

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
                propertysqf: el["PROPERTYSQFT"],
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
                props.setDialogInfo({
                  type: marker.type,
                  bath: marker.bath,
                  beds: marker.beds,
                  price: marker.price,
                  propertysqf: marker.propertysqf,
                });
                props.setDisplayDialog(true);
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
          try {
            document.getElementById("familyHousehold").innerText =
              obj["FamilyHousehold"];
            document.getElementById("medianHouseholdIncome").innerText =
              obj["MedianHouseholdIncome"];
            document.getElementById("singleHousehold").innerText =
              obj["SingleHousehold"];
            document.getElementById("population").innerText = obj["Population"];
            document.getElementById("populationDensity").innerText =
              obj["PopulationDensity"];
          } catch (error) {
            console.log(error);
          }

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

            // const footer = (tooltipItems) => {
            //   const desc = Object.keys(amenities()[tooltipItems[0].label]);
            //   let footer_string = "";
            //   desc.forEach((d) => {
            //     const arr = amenities()[tooltipItems[0].label][d];
            //     footer_string += `${d}:${arr.length}\n`;
            //   });
            //   return footer_string;
            // };

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

  createEffect(() => {
    if (propertyOnMap()) {
      if (!props.showHousesMarker) {
        propertyOnMap().forEach((marker) => {
          marker.setMap(null);
        });
      } else {
        propertyOnMap().forEach((marker) => {
          marker.setMap(props.map());
        });
      }
    }
  });

  createEffect(() => {
    highlighMarker(hoverType());
  });

  onCleanup(() => {
    const markers = amenitiesOnMap();
    const propertymarkers = propertyOnMap();
    if (markers) {
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      setAmenitiesOnMap([]);
    }
    if (propertymarkers) {
      propertymarkers.forEach((marker) => {
        marker.setMap(null);
      });
      setPropertyOnMap([]);
    }
  });

  return (
    <div
      class="w-[100%] rounded-lg
    h-[100%] border-2 border-teal-500 border-solid overflow-y-auto"
      id={`dashboardDiv-${[props.zip]}`}
    >
      {/* <Show when={showDialog() === true && dialogInfo()}>
        <MarkerDialog dialogInfo={dialogInfo()} />
      </Show> */}
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
          <div class="w-full bg-teal-500 text-white text-center cursor-pointer border-solid border-t-2 border-white">
            Real Estate Information
          </div>
          <div class="flex flex-row place-content-between px-4 py-2">
            <Show when={getPropertyType()}>
              <div>
                <DoughnutChart
                  datasets={getPropertyType()}
                  type="property"
                  setHoverType={setHoverType}
                />
              </div>
              <div>
                <Show
                  when={typeAvg()}
                  fallback={<div>Cannot get detailed information...</div>}
                >
                  <For each={typeAvg()} fallback={<div>Loading...</div>}>
                    {(item, index) => {
                      return (
                        <div>
                          <p
                            class="text-white rounded-lg"
                            style={{
                              "background-color": colorsChartjs[index()],
                            }}
                          >
                            {Object.keys(item)}
                          </p>
                          <div>
                            Average Price: {Object.values(item)[0].avgPrice}
                          </div>
                          <div>
                            Average Square Foot:{" "}
                            {Object.values(item)[0].avgSqft}
                          </div>
                          <div>
                            Average Price Per Square Foot:
                            {Object.values(item)[0].avgPricePerSqft}
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </Show>
              </div>
            </Show>
          </div>
          <Show when={props.recommendedZipcode().includes(parseInt(props.zip))}>
            <div>Future Prediction Information</div>
          </Show>
        </div>
        <div>
          <div>
            <Suspense>
              <Show when={amenities()}>
                <p class="bg-teal-500 text-white text-center">Amenities:</p>
                <div class="flex flex-row">
                  <DoughnutChart
                    datasets={amenities()}
                    zip={props.zip}
                    ref={(el) => (ref = el)}
                    type="amenities"
                  />
                  <div>Details</div>
                </div>
              </Show>
            </Suspense>
          </div>
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
                          type="gender"
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
                            type="race"
                          />
                        </Show>
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
