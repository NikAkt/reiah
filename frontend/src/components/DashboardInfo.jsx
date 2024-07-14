import { Loader } from "@googlemaps/js-api-loader";
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { DoughnutChart } from "./Charts";

const colorsChartjs = [
  "#36A2EB",
  "#FF6384",
  "#FF9F40",
  "#FFCD56",
  "#4BC0C0",
  "#9966FF",
  "#C9CBCF",
];

const AmenitiesDetailDropdown = ({ item }) => {
  const [displayDropdown, setDisplayDropdown] = createSignal(false);

  return (
    <div class="relative w-full overflow-x-auto">
      <div
        id="detail-title"
        class={`bg-teal-500 text-white rounded-lg cursor-pointer text-center 
          ${displayDropdown() === true ? "" : "opacity-60"}`}
        onClick={() => {
          setDisplayDropdown((prev) => !prev);
        }}
      >
        {`${item[0]} (${item[1].length})`}
      </div>
      <ul class={displayDropdown() === true ? "" : "hidden"}>
        {item[1].map((el) => (
          <li class="hover:bg-indigo-600 hover:text-white">{el}</li>
        ))}
      </ul>
    </div>
  );
};

const RealEstateInfo = ({
  getPropertyType,
  typeAvg,
  recommendedZipcode,
  Yr1_Price,
  Yr1_ROI,
  Yr3_Price,
  Yr3_ROI,
  Yr5_Price,
  Yr5_ROI,
  zip,
  setHoverType,
}) => {
  return (
    <div id="realEstate-info">
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
                        Average Square Foot: {Object.values(item)[0].avgSqft}
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
      <Show when={recommendedZipcode().includes(parseInt(zip))}>
        <div>
          <div>current price: </div>
          <div>
            <p>In the next year:</p>
            <div>1 year forecast price: {Yr1_Price()}</div>
            <div>1 year ROI: {Yr1_ROI()}</div>
          </div>

          <div>
            <p>In the next 3 year:</p>{" "}
            <div>3 year forecast price: {Yr3_Price()}</div>
            <div>3 year ROI: {Yr3_ROI()}</div>
          </div>

          <div>
            <p>In the next 5 year:</p>
            <div>5 year forecast price: {Yr5_Price()}</div>
            <div>5 year ROI: {Yr5_ROI()}</div>
          </div>
        </div>
      </Show>
    </div>
  );
};

const AmenitiesInfo = ({
  amenities,
  hoverAmenity,
  amenitiesDetails,
  zip,
  setHoverAmenity,
}) => {
  return (
    <div id="amenity-info">
      <div>
        <Suspense>
          <Show when={amenities()}>
            <p class="bg-teal-500 text-white text-center">
              Amenities Information
            </p>
            <div class="flex flex-row place-content-between">
              <DoughnutChart
                datasets={amenities()}
                zip={zip}
                ref={(el) => (ref = el)}
                type="amenities"
                setHoverAmenity={setHoverAmenity}
              />
              <div class="relative w-[40%] overflow-x-auto flex flex-col gap-2 py-2">
                <Show
                  when={hoverAmenity()}
                  fallback={
                    <div>Click the doughnutchart for more information</div>
                  }
                >
                  <div class="flex flex-col gap-2">
                    <p
                      class="text-white rounded-lg"
                      style={{
                        "background-color":
                          colorsChartjs[
                            Object.keys(amenitiesDetails()).indexOf(
                              hoverAmenity()
                            )
                          ],
                      }}
                    >
                      {hoverAmenity()}
                    </p>
                    <For
                      each={Object.entries(amenitiesDetails()[hoverAmenity()])}
                    >
                      {(item) => {
                        return <AmenitiesDetailDropdown item={item} />;
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </Suspense>
      </div>
    </div>
  );
};

const DemographicInfo = ({ gender, race, zip }) => {
  return (
    <div class="demographic-info ">
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
            Median Household Income
            <span id="medianHouseholdIncome"></span>
          </div>
          <div class="grid grid-cols-2">
            <div>
              <Suspense>
                <Show when={gender()}>
                  <p class="bg-teal-500 text-white text-center">Gender:</p>

                  <DoughnutChart
                    datasets={gender()}
                    zip={zip}
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
                      zip={zip}
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
  );
};

export const DashboardInfo = (props) => {
  const loader = new Loader({
    apiKey: "AIzaSyAyzZ_YJeiDD4_KcCZvLabRIzPiEXmuyBw",
    version: "weekly",
  });
  const [amenitiesOnMap, setAmenitiesOnMap] = createSignal([]);
  const [amenities, setAmenities] = createSignal({});
  const [amenitiesDetails, setAmenitiesDetails] = createSignal({});
  const [show, setShow] = createSignal(true);
  const [race, setRace] = createSignal({});
  const [gender, setGender] = createSignal({});
  // const [getPropertyPrice, setPropertyPrice] = createSignal([]);
  const [propertyOnMap, setPropertyOnMap] = createSignal([]);
  const [getPropertyType, setPropertyType] = createSignal([]);
  const [hoverType, setHoverType] = createSignal("");
  const [hoverAmenity, setHoverAmenity] = createSignal("");
  const [typeAvg, setTypeAvg] = createSignal([]);

  const [Yr1_Price, setYr1Price] = createSignal(null);
  const [Yr1_ROI, setYr1ROI] = createSignal(null);

  const [Yr3_Price, setYr3Price] = createSignal(null);
  const [Yr3_ROI, setYr3ROI] = createSignal(null);

  const [Yr5_Price, setYr5Price] = createSignal(null);
  const [Yr5_ROI, setYr5ROI] = createSignal(null);

  //show the dropdown menu for users to select the information on the board
  const [displayDropdownMenu, setDisplayDropdownMenu] = createSignal(false);

  //show the type of information on the board
  const [displayContent, setDisplayContent] = createSignal("realEstate");

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

  function highlighMarker(type, markerArr, key, color) {
    if (markerArr) {
      markerArr.forEach((marker) => {
        if (marker[key] == type) {
          marker.setIcon({
            //scale up the markers
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10, // Adjust the scale to make the circle smaller or larger
            fillColor: color, // Circle color
            fillOpacity: 1, // Circle fill opacity
            strokeWeight: 1, // Circle border thickness
            strokeColor: "#000000", // Circle border color
          });
          marker.setZIndex(100);
        } else {
          //recover to original icon
          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5, // Adjust the scale to make the circle smaller or larger
            fillColor: color, // Circle color
            fillOpacity: 1, // Circle fill opacity
            strokeWeight: 1, // Circle border thickness
            strokeColor: "#000000", // Circle border color
          });
          marker.setZIndex(10);
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
          if (hoverAmenity()) {
            setHoverAmenity(null);
          }
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

            setAmenitiesDetails(amenitiesObj);

            const labels = Object.keys(amenitiesObj);
            let data = [];
            for (let key of labels) {
              const obj = amenitiesObj[key];
              let value = 0;

              for (let desc of Object.keys(obj)) {
                value += obj[desc].length;
              }

              data.push(value);
            }
            const datasets = {
              labels,
              datasets: [{ label: "Amenities DoughnutChart", data }],
            };

            setAmenities(datasets);
          });
        }
      });
  };

  createEffect(() => {
    if (props.recommendedZipcode().includes(parseInt(props.zip))) {
      fetch(`http://localhost:8000/zipcode-scores?zipcode=${props.zip}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            const info = data[0];
            setYr1Price(info["1Yr_forecast_price"]);
            setYr1ROI(info["1Yr_ROI"]);

            setYr3Price(info["3Yr_forecast_price"]);
            setYr3ROI(info["3Yr_ROI"]);

            setYr5Price(info["5Yr_forecast_price"]);
            setYr5ROI(info["5Yr_ROI"]);
          }
        });
    }
  });

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
    highlighMarker(hoverType(), propertyOnMap(), "type", "#ffffff");
  });

  createEffect(() => {
    highlighMarker(
      hoverAmenity(),
      amenitiesOnMap(),
      "facility_type",
      "#0145ac"
    );
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
      class="w-[100%] rounded-lg  border-2 border-teal-500 border-solid overflow-y-auto"
      id={`dashboardDiv-${[props.zip]}`}
    >
      <div
        class="
        flex
        gap-8
        place-content-between
        w-full
        h-[30px]
        text-center justify-center 
        cursor-pointer
        bg-teal-500 text-white"
        id="dashboard-title"
      >
        <div
          onClick={() => {
            setShow((prev) => !prev);
          }}
        >
          ZIPCODE {props.zip},
          <span id={`neighbourhood-dashboardInfo-${props.zip}`}></span>,
          <span id={`borough-dashboardInfo-${props.zip}`}></span>
        </div>
        <div
          class="absolute w-[15%]
        flex flex-col rounded-lg shadow-md
        text-black right-[10%] rounded-md z-30"
        >
          <div
            class="relative h-[25%] hover:bg-indigo-600 hover:text-white bg-white"
            onClick={() => {
              setDisplayDropdownMenu((prev) => !prev);
            }}
          >
            Select
          </div>
          <div class={displayDropdownMenu() ? "bg-white" : "hidden"}>
            <ul class="grid grid-cols-1 divide-y">
              <li
                class="hover:bg-teal-500 hover:text-white"
                onClick={() => {
                  setDisplayContent("realEstate");
                }}
              >
                Real Estate{" "}
              </li>
              <li
                class="hover:bg-teal-500 hover:text-white"
                onClick={() => {
                  setDisplayContent("amenities");
                }}
              >
                Amenities
              </li>
              <li
                class="hover:bg-teal-500 hover:text-white"
                onClick={() => {
                  setDisplayContent("demographic");
                }}
              >
                Demographic
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class={`flex flex-col relative 
      w-[100%] place-content-stretch
       ${show() ? "" : "hidden"}`}
      >
        <Show when={displayContent() === "realEstate"}>
          <RealEstateInfo
            getPropertyType={getPropertyType}
            typeAvg={typeAvg}
            recommendedZipcode={props.recommendedZipcode}
            Yr1_Price={Yr1_Price}
            Yr1_ROI={Yr1_ROI}
            Yr3_Price={Yr3_Price}
            Yr3_ROI={Yr3_ROI}
            Yr5_Price={Yr5_Price}
            Yr5_ROI={Yr5_ROI}
            zip={props.zip}
            setHoverType={setHoverType}
          />
        </Show>

        <Show when={displayContent() === "amenities"}>
          <AmenitiesInfo
            amenities={amenities}
            hoverAmenity={hoverAmenity}
            amenitiesDetails={amenitiesDetails}
            zip={props.zip}
            setHoverAmenity={setHoverAmenity}
          />
        </Show>

        <Show when={displayContent() === "demographic"}>
          <DemographicInfo gender={gender} race={race} zip={props.zip} />
        </Show>
      </div>
    </div>
  );
};
