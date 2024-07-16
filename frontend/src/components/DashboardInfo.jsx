import { Loader } from "@googlemaps/js-api-loader";
import {
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import { DoughnutChart, LineChart } from "./Charts";
import arrow_down from "../assets/down-arrow-backup-2-svgrepo-com.svg";
import arrow_up from "../assets/down-arrow-backup-3-svgrepo-com.svg";

const colorsChartjs = [
  "#36A2EB",
  "#FF6384",
  "#FF9F40",
  "#FFCD56",
  "#4BC0C0",
  "#9966FF",
  "#C9CBCF",
];

function highlightMarker(type, markerArr, originalIcon, newIcon, key) {
  if (markerArr) {
    markerArr.forEach((marker) => {
      if (marker[key] == type) {
        marker.setIcon(newIcon);
        marker.setZIndex(100);
      } else {
        //recover to original icon
        marker.setIcon(originalIcon);
        marker.setZIndex(10);
      }
    });
  }
}

function revertMarkerIcon(markerArr, originalIcon) {
  if (markerArr) {
    markerArr.forEach((marker) => {
      marker.setIcon(originalIcon);
    });
  }
}

const AmenitiesDetailDropdown = ({
  item,
  amenitiesOnMap,
  newAmenitiesDetailedMarkerIcon,
  amenitiesMarkerIcon,
}) => {
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
          <li
            class="hover:bg-indigo-600 hover:text-white"
            onMouseOver={() => {
              highlightMarker(
                el,
                amenitiesOnMap(),
                amenitiesMarkerIcon,
                newAmenitiesDetailedMarkerIcon,
                "title"
              );
            }}
            onMouseDown={() => {
              revertMarkerIcon(amenitiesOnMap(), amenitiesMarkerIcon);
            }}
          >
            {el}
          </li>
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
  getSelectedZip,
  setHoverType,
  predictedPrice,
  query,
}) => {
  return (
    <div id="realEstate-info" class="dark:text-white">
      {/* <div class="w-full bg-teal-500 text-white text-center cursor-pointer border-solid border-t-2 border-white">
        Real Estate Information
      </div> */}
      <div class="flex flex-col ">
        <div>
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
                            Average Price: ${Object.values(item)[0].avgPrice}
                          </div>
                          <div>
                            Average Size: {Object.values(item)[0].avgSqft} sqft
                          </div>
                          <div>
                            Average Price Per Square Foot: $
                            {Object.values(item)[0].avgPricePerSqft}/sqft
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </Show>
              </div>
            </Show>
          </div>
        </div>

        <div>
          {/* <p>Prediction</p> */}
          <Show
            when={recommendedZipcode().includes(parseInt(getSelectedZip()))}
          >
            <div>
              <div>
                <span>For ZIPCODE {getSelectedZip()}:</span>
                <div>
                  <p class="bg-teal-500 text-white w-[30%]">
                    In the next year:
                  </p>
                  <div>1 year forecast price: {Yr1_Price()}</div>
                  <div>1 year ROI: {(Yr1_ROI() * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <p class="bg-teal-500 text-white w-[30%]">
                    In the next 3 year:
                  </p>{" "}
                  <div>3 year forecast price: {Yr3_Price()}</div>
                  <div>3 year ROI: {(Yr3_ROI() * 100).toFixed(2)}%</div>
                </div>{" "}
                <div>
                  <p class="bg-teal-500 text-white w-[30%]">
                    In the next 5 year:
                  </p>
                  <div>5 year forecast price: {Yr5_Price()}</div>
                  <div>5 year ROI: {(Yr5_ROI() * 100).toFixed(2)}%</div>
                </div>
              </div>
              <div>
                For a {query()["house_type"]} that has:
                <ul>
                  <li>Size: {query()["sqft"]} square foot</li>
                  <li>Bedrooms: {query()["bedrooms"]}</li>
                  <li>Bathrooms: {query()["bathrooms"]}</li>
                </ul>
                the average predicted cost will be is{" "}
                {predictedPrice()[getSelectedZip()]}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};

const AmenitiesInfo = ({
  amenities,
  hoverAmenity,
  amenitiesDetails,
  getSelectedZip,
  setHoverAmenity,
  amenitiesOnMap,
  newAmenitiesDetailedMarkerIcon,
  amenitiesMarkerIcon,
}) => {
  return (
    <div id="amenity-info" class="dark:text-white">
      <div>
        <Suspense>
          <Show when={amenities()}>
            {/* <p class="bg-teal-500 text-white text-center">
              Amenities Information
            </p> */}
            <div class="flex flex-row place-content-between">
              <DoughnutChart
                datasets={amenities()}
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
                        return (
                          <AmenitiesDetailDropdown
                            item={item}
                            amenitiesOnMap={amenitiesOnMap}
                            newAmenitiesDetailedMarkerIcon={
                              newAmenitiesDetailedMarkerIcon
                            }
                            amenitiesMarkerIcon={amenitiesMarkerIcon}
                          />
                        );
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

const DemographicInfo = ({
  gender,
  race,
  getSelectedZip,
  singleHousehold,
  familyHousehold,
  income,
  population,
  density,
}) => {
  return (
    <div id="demographic-info" class="dark:text-white">
      {/* <div
        class="bg-teal-500 text-white items-center
           text-center justify-center items-center"
      >
        Demographic Information
      </div> */}
      <div class="grid grid-cols-1 divide-y gap-2">
        <div class="grid grid-cols-1 divide-y">
          <div>Family Household: {familyHousehold()}</div>
          <div>Single Household: {singleHousehold()}</div>
          <div>Population: {population()}</div>
          <div>Population Density: {density()}</div>
          <div>Median Household Income: {income()}</div>
          <div class="grid grid-cols-2">
            <div>
              <Suspense>
                <Show when={gender()}>
                  <p class="bg-teal-500 text-white text-center">Gender:</p>

                  <DoughnutChart
                    datasets={gender()}
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

export const DashboardInfo = ({
  map,
  historicalRealEstateData,
  recommendedZipcode,
  setDisplayDialog,
  setDialogInfo,
  query,
  predictedPrice,
  getComparedZip,
  setComparedZip,
  getSelectedZip,
  setCreateMoreDashboardInfo,
}) => {
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

  const [clean, setClean] = createSignal(false);

  const [showDropDown, setShowDropDown] = createSignal(false);

  //   level: borough/neighbourhood/zipcode
  //  area: "Bronx"/"Greenpoint"/11385

  //demogrphic signals
  const [familyHousehold, setFamilyHousehold] = createSignal(null);
  const [singleHousehold, setSingleHousehold] = createSignal(null);
  const [population, setPopulation] = createSignal(null);
  const [density, setDensity] = createSignal(null);
  const [income, setIncome] = createSignal(null);

  //control linecharts
  const [updateLineChart, setUpdateLineChart] = createSignal(false);
  const [cleanLineChart, setCleanLineChart] = createSignal(false);

  //unique zipcodes that has historical information
  const uniqueZipcode = Object.keys(historicalRealEstateData);

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

  const amenitiesMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 5, // Adjust the scale to make the circle smaller or larger
    fillColor: "#0145ac", // Circle color
    fillOpacity: 1, // Circle fill opacity
    strokeWeight: 1, // Circle border thickness
    strokeColor: "#000000", // Circle border color
  };

  const newAmenitiesMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10, // Adjust the scale to make the circle smaller or larger
    fillColor: "#0145ac", // Circle color
    fillOpacity: 1, // Circle fill opacity
    strokeWeight: 1, // Circle border thickness
    strokeColor: "#000000", // Circle border color
  };
  const newAmenitiesDetailedMarkerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 15, // Adjust the scale to make the circle smaller or larger
    fillColor: "rgb(124 58 237)", // Circle color
    fillOpacity: 1, // Circle fill opacity
    strokeWeight: 1, // Circle border thickness
    strokeColor: "#000000", // Circle border color
  };

  const propertyMarkerIcon = {
    url: `data:image/svg+xml;base64,${window.btoa(`
    <svg fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
   
   <rect x="20" y="80" width="200" height="80" rx="20" ry="20" fill="#ffffff" />
    </svg>`)}`,
    scaledSize: new google.maps.Size(60, 60),
  };

  const newPropertyMarkerIcon = {
    url: `data:image/svg+xml;base64,${window.btoa(`
        <svg fill="${"#ffffff"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
       
       <rect x="20" y="80" width="200" height="80" rx="20" ry="20" fill="#ffffff" />
        </svg>`)}`,
    scaledSize: new google.maps.Size(80, 80),
  };

  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          // [{"neighbourhood":"West Central Queens","borough":"Queens","zipcodes":[11374,11375,11379,11385]}]
          const obj = data[0];
          try {
            document.getElementById(
              `borough-dashboardInfo-${getSelectedZip()}`
            ).innerText = obj["borough"];
            document.getElementById(
              `neighbourhood-dashboardInfo-${getSelectedZip()}`
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

            let markers = [];

            const color = "#ffffff";
            const svg = window.btoa(`
  <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
 
 <rect x="20" y="80" width="200" height="80" rx="20" ry="20" fill="${color}" />
  </svg>`);
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
                map: map(),
                label: {
                  text: `\$${(el["PRICE"] / 1000).toFixed(0).toString()}k`,
                  color: "black",
                },
                icon: propertyMarkerIcon,
              });
              markers.push(marker);
              marker.addListener("click", () => {
                setDialogInfo({
                  "House Type": marker.type,
                  Bathroom: marker.bath,
                  Bedroom: marker.beds,
                  price: `\$${marker.price}`,
                  size: `${marker.propertysqf} sqft`,
                });
                setDisplayDialog(true);
              });
            });
            setPropertyOnMap(markers);
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
            setFamilyHousehold(obj["FamilyHousehold"]);
            setIncome(obj["MedianHouseholdIncome"]);
            setSingleHousehold(obj["SingleHousehold"]);
            setPopulation(obj["Population"]);
            setDensity(obj["PopulationDensity"]);
          } catch (error) {
            console.log(error);
          }
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
                map: map(),
                icon: amenitiesMarkerIcon,
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
    if (recommendedZipcode().includes(parseInt(getSelectedZip()))) {
      fetch(`http://localhost:8000/zipcode-scores?zipcode=${getSelectedZip()}`)
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
    if (getSelectedZip() !== "") {
      fetchDashboardInfoData("zipcode", getSelectedZip());
    }
  });

  createEffect(() => {
    if (hoverType()) {
      highlightMarker(
        hoverType(),
        propertyOnMap(),
        propertyMarkerIcon,
        newPropertyMarkerIcon,
        "type"
      );
    }
  });

  createEffect(() => {
    highlightMarker(
      hoverAmenity(),
      amenitiesOnMap(),
      amenitiesMarkerIcon,
      newAmenitiesMarkerIcon,
      "facility_type"
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

  function handleSubmit() {
    const zipArray = [...new Set([...getComparedZip()])];
    if (zipArray.includes(getSelectedZip() * 1)) {
      zipArray.pop(getSelectedZip() * 1);
    }
    if (zipArray.length > 1) {
      let query = "";
      for (let i = 0; i < zipArray.length; i++) {
        if (i > 6) {
          //limit is 7
          break;
        }
        // console.log(zipArray[i]);
        if (i == 0) {
          query += `?zipcode=${zipArray[i]}`;
        } else {
          query += `&zipcode=${zipArray[i]}`;
        }
      }
    }
    setComparedZip(zipArray);
    setUpdateLineChart(true);
    setClean(true);
  }

  return (
    <div id={`dashboardDiv-${[getSelectedZip()]}`}>
      <div
        class="absolute flex flex-col w-full top-[3vh]
      dark:text-white"
        id="header-dashboard"
      >
        <h1
          class="font-medium w-[100%] place-content-between"
          id="dashboard_top"
        >
          {`Information on ZIPCODE ${getSelectedZip()} `}
          <span id={`neighbourhood-dashboardInfo-${getSelectedZip()}`}></span>,
          <span id={`borough-dashboardInfo-${getSelectedZip()}`}></span>
        </h1>

        {/* input & dropdown */}
        <div class="">
          <Show when={getSelectedZip()}>
            <div
              class="flex
            w-[50%] gap-2 my-2 min-h-[3vh]
            "
            >
              <div id="search-box-dropdown" class="z-40 flex flex-col">
                {/* search box */}
                <div
                  class="rounded-t-lg text-center
                  relative bg-[#ffffff] flex gap-2
                  max-h-[3vh] px-2
                  items-center justify-center"
                >
                  {/* button svg */}
                  <Show
                    when={showDropDown() === false}
                    fallback={
                      <button
                        onClick={() => setShowDropDown(false)}
                        class="hover:bg-teal-500"
                      >
                        <img src={arrow_up} class="w-[15px] h-[15px]" />
                      </button>
                    }
                  >
                    <button
                      onClick={() => setShowDropDown(true)}
                      class="hover:bg-teal-500"
                    >
                      <img src={arrow_down} class="w-[15px] h-[15px]" />
                    </button>
                  </Show>

                  {/* input box */}
                  <input
                    type="text"
                    placeholder={`Compare To? ${getComparedZip()}`}
                    id="compareSearchBar"
                    onKeyUp={(event) => {
                      if (event.key === "Enter") {
                        if (uniqueZipcode.includes(event.target.value)) {
                          setComparedZip((prev) => [
                            ...new Set([...prev, event.target.value * 1]),
                          ]);

                          if (
                            !document.getElementById(
                              `compareCheckbox-${event.target.value}`
                            ).checked
                          ) {
                            document.getElementById(
                              `compareCheckbox-${event.target.value}`
                            ).checked = true;
                          }
                          event.target.value = "";
                        } else {
                          alert("The zipcode you provided is not included.");
                        }
                      }
                    }}
                  />
                </div>

                {/* dropdown */}

                <div
                  class={`overflow-y-auto bg-[#ffffff] max-h-[20vh] w-full
                     shadow-md
                   z-40 ${showDropDown() ? "block" : "hidden"}`}
                >
                  <div>
                    {uniqueZipcode.map((zip) => (
                      <div key={zip} class="p-2">
                        <input
                          type="checkbox"
                          id={`compareCheckbox-${zip}`}
                          value={zip}
                          class="accent-teal-500 compareCheckbox"
                          onClick={(event) => {
                            if (event.target.checked) {
                              setComparedZip((prev) => [
                                ...prev,
                                event.target.value * 1,
                              ]);
                            } else {
                              setComparedZip((prev) =>
                                prev.filter(
                                  (el) => el != event.target.value * 1
                                )
                              );
                            }
                          }}
                        />

                        <label htmlFor={`compareCheckbox-${zip}`} class="ml-2">
                          {zip}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* submit button and clean button */}
              <div class="flex max-h-[3vh] gap-[2px]">
                <input
                  type="Submit"
                  class="relative ml-[2%] rounded-lg bg-black text-white cursor-pointer px-2"
                  onClick={handleSubmit}
                />
                <button
                  class={
                    clean()
                      ? "relative ml-[2%] bg-black px-[2%] rounded-lg text-center text-white cursor-pointe r"
                      : "relative ml-[2%] bg-black px-[2%] rounded-lg text-center text-white cursor-not-allowed opacity-50"
                  }
                  onClick={() => {
                    setCreateMoreDashboardInfo(false);
                    for (let zip of getComparedZip()) {
                      const checkbox = document.getElementById(
                        `compareCheckbox-${zip}`
                      );
                      checkbox.checked = false;
                    }
                    setComparedZip([]);
                    setCleanLineChart(true);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
      <div class="w-[95%] h-[1px] mt-[4vh] bg-[#E4E4E7]" id="main">
        {/* <div
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
          {/* <div
            onClick={() => {
              setShow((prev) => !prev);
            }}
          >
          
          </div> */}
        {/* <div
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
                    revertMarkerIcon(amenitiesOnMap(), amenitiesMarkerIcon);
                  }}
                >
                  Real Estate{" "}
                </li>
                <li
                  class="hover:bg-teal-500 hover:text-white"
                  onClick={() => {
                    setDisplayContent("amenities");
                    revertMarkerIcon(propertyOnMap(), propertyMarkerIcon);
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
          </div> */}

        <div
          class={`grid grid-row-1 divide-y relative 
      w-[100%] place-content-stretch
       ${show() ? "" : "hidden"}`}
        >
          <div>
            <p class="text-lg">Real Estate Information</p>
            <div
              id="real-estate-content"
              class="grid grid-row-1 divide-y w-[90%] items-center m-auto"
            >
              <div id="historic-home-values" class="min-h-[40vh]">
                <LineChart
                  getComparedZip={getComparedZip}
                  getSelectedZip={getSelectedZip}
                  updateLineChart={updateLineChart}
                  setUpdateLineChart={setUpdateLineChart}
                  cleanLineChart={cleanLineChart}
                  setCleanLineChart={setCleanLineChart}
                ></LineChart>
              </div>
              <div id="sales-2023" class="relative w-full">
                <p>
                  Residential Property Sales(2023){" "}
                  <span>Data Source: Zillow</span>
                </p>
                <RealEstateInfo
                  getPropertyType={getPropertyType}
                  typeAvg={typeAvg}
                  recommendedZipcode={recommendedZipcode}
                  Yr1_Price={Yr1_Price}
                  Yr1_ROI={Yr1_ROI}
                  Yr3_Price={Yr3_Price}
                  Yr3_ROI={Yr3_ROI}
                  Yr5_Price={Yr5_Price}
                  Yr5_ROI={Yr5_ROI}
                  getSelectedZip={getSelectedZip}
                  setHoverType={setHoverType}
                  predictedPrice={predictedPrice}
                  query={query}
                />
              </div>
              <div id="sales-2024">
                <div
                  class="hover:text-indigo-600 cursor-pointer w-[85%]
                hover:border-b-2 hover:border-solid hover:border-indigo-600"
                >
                  Want to know the how much you gonna need to get a home in
                  2024?
                </div>
              </div>
            </div>
          </div>

          <div>
            <p>Amenities Information</p>
            <div class="grid grid-row-1 divide-y w-[90%] items-center m-auto">
              <AmenitiesInfo
                amenities={amenities}
                hoverAmenity={hoverAmenity}
                amenitiesDetails={amenitiesDetails}
                getSelectedZip={getSelectedZip}
                setHoverAmenity={setHoverAmenity}
                amenitiesOnMap={amenitiesOnMap}
                newAmenitiesDetailedMarkerIcon={newAmenitiesDetailedMarkerIcon}
                amenitiesMarkerIcon={amenitiesMarkerIcon}
              />
            </div>
          </div>

          <div>
            <p>Other Information</p>
            <div class="grid grid-row-1 divide-y w-[90%] items-center m-auto">
              <p>Demographic</p>
              <DemographicInfo
                gender={gender}
                race={race}
                getSelectedZip={getSelectedZip}
                singleHousehold={singleHousehold}
                familyHousehold={familyHousehold}
                population={population}
                density={density}
                income={income}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
