import { Loader } from "@googlemaps/js-api-loader";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { LineChart } from "./Charts";
import arrow_down from "../assets/down-arrow-backup-2-svgrepo-com.svg";
import arrow_up from "../assets/down-arrow-backup-3-svgrepo-com.svg";

import AmenitiesInfo from "./AmenitiesInfo";
import RealEstateInfo from "./RealEstateInfo";
import DemographicInfo from "./DemographicInfo";
import MarkerLegend from "./MarkerLegend";

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
  const [borough, setBorough] = createSignal("");
  const [neighbourhood, setNeighbourhood] = createSignal("");
  const [show, setShow] = createSignal(true);
  const [clean, setClean] = createSignal(false);

  const [showDropDown, setShowDropDown] = createSignal(false);

  //control linecharts
  const [updateLineChart, setUpdateLineChart] = createSignal(false);
  const [cleanLineChart, setCleanLineChart] = createSignal(false);

  //control realestateinfo, amenitiesinfo ...
  const [updateInfo, setUpdateInfo] = createSignal(false);
  //control sliding the multiple information
  const [showWhichRealEstate, setShowWhichRealEstate] = createSignal(
    getSelectedZip()
  );

  const [draggableMarker, setDraggableMarker] = createSignal(null);
  const [lat, setLat] = createSignal(0);
  const [lon, setLon] = createSignal(0);
  const [predictedCost, setPredictedCost] = createSignal(null);
  //unique zipcodes that has historical information
  const uniqueZipcode = Object.keys(historicalRealEstateData);

  //unique house type of the zipcode
  const [uniqueHouseType, setUniqueHouseType] = createSignal([]);

  const [Yr1_Price, setYr1Price] = createSignal(null);

  const [Yr3_Price, setYr3Price] = createSignal(null);

  const [Yr5_Price, setYr5Price] = createSignal(null);

  //show the type of information on the board
  const [mainInfo, setMainInfo] = createSignal("realEstate");

  const fetchDashboardInfoData = async (level, area) => {
    fetch(`http://localhost:8000/api/borough-neighbourhood?${level}=${area}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const obj = data[0];
          try {
            setBorough(obj["borough"]);
            setNeighbourhood(obj["neighbourhood"]);
          } catch (error) {
            console.log(error);
          }
        } else {
          console.log("No Borough-Neighbourhood data found.");
        }
      });
  };

  const fetchPredictedHomePrice = (
    borough,
    house_type,
    beds,
    baths,
    sqft,
    lat,
    lng,
    zip
  ) => {
    fetch(
      `http://localhost:5001/predict_price?borough=${borough}&house_type=${house_type}&bedrooms=${beds}&bathrooms=${baths}&sqft=${sqft}&latitude=${lat}&longitude=${lng}&zipcode=${zip}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.hasOwnProperty("predicted_price")) {
          setPredictedCost(data["predicted_price"]);
        } else {
          return null;
        }
      });
  };

  createEffect(() => {
    if (getSelectedZip() !== "") {
      fetchDashboardInfoData("zipcode", getSelectedZip());
    }
  });

  createEffect(() => {
    console.log(predictedCost());
  });

  onCleanup(() => {
    setComparedZip([]);
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
    setUpdateInfo(true);
    setShowWhichRealEstate(getSelectedZip());
    setClean(true);
  }

  const handleSubmitPredictedPrice = () => {
    const sqft = document.getElementById("size-p").value;
    const beds = document.getElementById("bedrooms-p").value;
    const baths = document.getElementById("bathrooms-p").value;
    const house_type = document.getElementById("house_type-p").value;
    fetchPredictedHomePrice(
      borough(),
      house_type,
      beds,
      baths,
      sqft,
      lat(),
      lon(),
      getSelectedZip()
    );
  };

  return (
    <div
      id={`dashboardDiv-${[getSelectedZip()]}`}
      class="grid grid-row-1 divide-y"
    >
      <div
        class=" flex top-[4vh]
      dark:text-white w-[100%] py-[2px] place-content-between
    
      "
      >
        <div id="header-dashboard">
          <h1
            class="font-medium w-[100%] place-content-between"
            id="dashboard_top"
          >
            {`Information on ZIPCODE ${getSelectedZip()}`},
            <span>{neighbourhood()}</span>,<span>{borough()}</span>
          </h1>

          {/* input & dropdown */}
          <div>
            <Show when={getSelectedZip()}>
              <div
                class="flex
            w-[50%] gap-2 my-2 min-h-[3vh]
            "
              >
                <div id="search-box-dropdown" class="z-40 flex flex-col">
                  {/* search box */}
                  <div
                    class="rounded-lg text-center
                  relative bg-[#ffffff] flex gap-2
                  min-h-[3vh] px-2 border border-solid border-teal-500
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
                      placeholder={
                        getComparedZip().length === 0
                          ? "Select other zipcodes"
                          : getComparedZip()
                      }
                      id="compareSearchBar"
                      class="relative min-w-[20px] h-full border-none"
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

                          <label
                            htmlFor={`compareCheckbox-${zip}`}
                            class="ml-2"
                          >
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
                    class={`relative ml-[2%] rounded-lg bg-teal-500 text-white px-2 ${
                      getComparedZip().length > 0
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-50 disabled"
                    }`}
                    onClick={handleSubmit}
                  />
                  <button
                    class={
                      getComparedZip().length > 0
                        ? "relative ml-[2%] bg-teal-500 px-2 rounded-lg text-center text-white"
                        : "relative ml-[2%] bg-teal-500 px-2 rounded-lg text-center text-white cursor-not-allowed opacity-50 disabled"
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
                      setUpdateLineChart(false);
                      setCleanLineChart(true);
                      setUpdateInfo(false);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
        <div class="right-[4vw]">
          <MarkerLegend />
        </div>
      </div>

      <div class="w-[95%] h-[1px] mt-[4vh] py-[2vh]" id="main">
        <div
          class="rounded-lg shadow-lg w-[60%]
        mx-auto grid grid-cols-3 divide-x h-[6vh] mb-[3vh]"
          id="control-button"
        >
          <div
            class={`relative flex items-center justify-center
          ${
            mainInfo() === "realEstate"
              ? "bg-teal-500 text-white"
              : "bg-white text-black"
          } rounded-l-lg cursor-pointer hover:border hover:border-solid 
          shadow-lg py-2 px-2 overflow-hidden`}
            onClick={() => {
              setMainInfo("realEstate");
            }}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 50 50"
              version="1.2"
              baseProfile="tiny"
              xmlns="http://www.w3.org/2000/svg"
              overflow="inherit"
              class="relative w-1/3 h-5/6"
            >
              <path d="M14.237 39.5h30.483v-26.081h-30.483v26.081zm15.489-23.485l10.99 9.598h-2.769v11.516h-6.436v-8.129h-4.065v8.129h-6.096v-11.516h-2.84l11.216-9.598zm-18.876-9.031v-5.966h-6.774v48.982h6.774v-39.967h35.226v-3.049z" />
            </svg>
            Real Estate
          </div>
          <div
            class={`relative flex items-center justify-center
              ${
                mainInfo() === "amenities"
                  ? "bg-teal-500 text-white"
                  : "bg-white text-black"
              } cursor-pointer 
              hover:border-solid hover:border
          shadow-lg py-2 px-2 overflow-hidden`}
            onClick={() => {
              setMainInfo("amenities");
            }}
          >
            <svg
              version="1.1"
              id="_x32_"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 512 512"
              xml:space="preserve"
              fill="currentColor"
              class="relative w-1/3 h-5/6"
            >
              <g>
                <path
                  class="st0"
                  d="M484.058,430.039v-58.42h-71.14h-71.122v58.42l-27.95,12.711v20.317h99.072H512V442.75L484.058,430.039z
		 M458.646,430.039h-45.728h-45.719v-22.864h45.719h45.728V430.039z"
                />
                <rect
                  x="322.966"
                  y="473.23"
                  class="st0"
                  width="22.864"
                  height="38.104"
                />
                <rect
                  x="480.014"
                  y="473.23"
                  class="st0"
                  width="22.864"
                  height="38.104"
                />
                <rect
                  x="442.056"
                  y="473.23"
                  class="st0"
                  width="22.874"
                  height="20.943"
                />
                <rect
                  x="360.915"
                  y="473.23"
                  class="st0"
                  width="22.865"
                  height="20.943"
                />
                <path
                  class="st0"
                  d="M354.459,327.146c37.371-14.16,63.989-50.178,63.989-92.51c0-26.84-10.722-51.143-28.066-68.969
		c0.628-4.69,1.072-9.42,1.072-14.274c0-54-40.527-98.474-92.808-104.864C272.364,18.377,235.032,0.666,193.473,0.666
		c-79.518,0-143.981,64.461-143.981,143.98c0,0.425,0.058,0.83,0.058,1.245C19.66,166.111,0,200.325,0,239.134
		c0,53.209,36.984,97.682,86.621,109.38c10.067,24.62,34.215,41.993,62.465,41.993c10.529,0,20.451-2.481,29.33-6.776v127.602
		h77.327v-83.775l30.161-51.52C316.77,373.791,342.848,354.333,354.459,327.146z M213.828,341.999
		c0.647,0.926,1.342,1.824,2.037,2.722l-3.426,1.39C212.93,344.749,213.412,343.389,213.828,341.999z M238.024,405.014v-40.47
		c7.162,4.344,15.037,7.625,23.434,9.585L238.024,405.014z"
                />
              </g>
            </svg>
            Amenities
          </div>
          <div
            class={`relative flex items-center justify-center
              ${
                mainInfo() === "other"
                  ? "bg-teal-500 text-white"
                  : "bg-white text-black"
              } rounded-r-lg cursor-pointer hover:border-solid hover:border hover:border
              shadow-lg py-2 px-2 overflow-hidden`}
            onClick={() => {
              setMainInfo("other");
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              class="relative w-1/3 h-5/6"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3 18C3 15.3945 4.66081 13.1768 6.98156 12.348C7.61232 12.1227 8.29183 12 9 12C9.70817 12 10.3877 12.1227 11.0184 12.348C11.3611 12.4703 11.6893 12.623 12 12.8027C12.3107 12.623 12.6389 12.4703 12.9816 12.348C13.6123 12.1227 14.2918 12 15 12C15.7082 12 16.3877 12.1227 17.0184 12.348C19.3392 13.1768 21 15.3945 21 18V21H15.75V19.5H19.5V18C19.5 15.5147 17.4853 13.5 15 13.5C14.4029 13.5 13.833 13.6163 13.3116 13.8275C14.3568 14.9073 15 16.3785 15 18V21H3V18ZM9 11.25C8.31104 11.25 7.66548 11.0642 7.11068 10.74C5.9977 10.0896 5.25 8.88211 5.25 7.5C5.25 5.42893 6.92893 3.75 9 3.75C10.2267 3.75 11.3158 4.33901 12 5.24963C12.6842 4.33901 13.7733 3.75 15 3.75C17.0711 3.75 18.75 5.42893 18.75 7.5C18.75 8.88211 18.0023 10.0896 16.8893 10.74C16.3345 11.0642 15.689 11.25 15 11.25C14.311 11.25 13.6655 11.0642 13.1107 10.74C12.6776 10.4869 12.2999 10.1495 12 9.75036C11.7001 10.1496 11.3224 10.4869 10.8893 10.74C10.3345 11.0642 9.68896 11.25 9 11.25ZM13.5 18V19.5H4.5V18C4.5 15.5147 6.51472 13.5 9 13.5C11.4853 13.5 13.5 15.5147 13.5 18ZM11.25 7.5C11.25 8.74264 10.2426 9.75 9 9.75C7.75736 9.75 6.75 8.74264 6.75 7.5C6.75 6.25736 7.75736 5.25 9 5.25C10.2426 5.25 11.25 6.25736 11.25 7.5ZM15 5.25C13.7574 5.25 12.75 6.25736 12.75 7.5C12.75 8.74264 13.7574 9.75 15 9.75C16.2426 9.75 17.25 8.74264 17.25 7.5C17.25 6.25736 16.2426 5.25 15 5.25Z"
                fill="current-color"
                overflow="inherit"
              />
            </svg>
            Other
          </div>
        </div>
        <div
          class={`grid grid-row-1 divide-y relative 
      w-[100%] place-content-stretch
       ${show() ? "" : "hidden"}`}
          id="main-info-section"
        >
          <div
            class={`grid grid-row-1 divide-y ${
              mainInfo() === "realEstate" ? "" : "hidden"
            }`}
          >
            {/* <p class="text-lg">Real Estate Information</p> */}
            <div
              class="relative grid grid-cols-3 mx-auto divide-x mb-[2vh]
            w-5/6 items-center justify-center"
            >
              <a
                class="text-gray-500 m-auto hover:text-teal-500"
                href="#historic-home-values"
              >
                <p class="text-center">Historical Home Value</p>
              </a>
              <a
                class="text-gray-500 m-auto hover:text-teal-500 
                flex"
                href="#sales-2023"
              >
                <p class="text-center">2023 Sales</p>
              </a>
              <a
                class="text-gray-500 m-auto hover:text-teal-500"
                href="#sales-2024"
              >
                <p class="text-center">Predict 2024 Sales Price</p>
              </a>
            </div>
            <div
              id="real-estate-content"
              class="grid grid-row-1 divide-y w-[90%] items-center m-auto"
            >
              <div id="historic-home-values" class="min-h-[40vh]">
                <p class="text-2xl">
                  Historical Home Value of the entire Zipcode
                </p>
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
                <a class="text-2xl">2023 Residential Property Sales</a>
                <p class="text-sm">Data Source: Zillow</p>
                <Show when={updateInfo()}>
                  <div class="flex gap-2">
                    <button
                      class={`bg-black text-white px-2 ${
                        showWhichRealEstate() === getSelectedZip()
                          ? ""
                          : "opacity-30"
                      }`}
                      onClick={() => {
                        setShowWhichRealEstate(getSelectedZip());
                      }}
                    >
                      {getSelectedZip()}
                    </button>
                    <For each={getComparedZip()}>
                      {(item, index) => {
                        return (
                          <button
                            class={`bg-black text-white px-2 ${
                              showWhichRealEstate() === item ? "" : "opacity-30"
                            }`}
                            onClick={() => {
                              setShowWhichRealEstate(item);
                            }}
                          >
                            {item}
                          </button>
                        );
                      }}
                    </For>
                  </div>
                </Show>

                <div class="relative w-full">
                  <div
                    class={
                      showWhichRealEstate() === getSelectedZip() ||
                      !updateInfo()
                        ? ""
                        : "hidden"
                    }
                  >
                    <RealEstateInfo
                      map={map}
                      setDialogInfo={setDialogInfo}
                      setDisplayDialog={setDisplayDialog}
                      highlightMarker={highlightMarker}
                      recommendedZipcode={recommendedZipcode}
                      getSelectedZip={getSelectedZip}
                      predictedPrice={predictedPrice}
                      query={query}
                      loader={loader}
                      loadCompared={false}
                      setUniqueHouseType={setUniqueHouseType}
                      setDraggableMarker={setDraggableMarker}
                      draggableMarker={draggableMarker}
                      setLat={setLat}
                      setLon={setLon}
                    />
                  </div>{" "}
                  <Show when={updateInfo()}>
                    <For each={getComparedZip()}>
                      {(item, index) => (
                        <div
                          class={showWhichRealEstate() === item ? "" : "hidden"}
                        >
                          <RealEstateInfo
                            map={map}
                            setDialogInfo={setDialogInfo}
                            setDisplayDialog={setDisplayDialog}
                            highlightMarker={highlightMarker}
                            recommendedZipcode={recommendedZipcode}
                            getSelectedZip={item}
                            predictedPrice={predictedPrice}
                            query={query}
                            loader={loader}
                            loadCompared={true}
                            setUniqueHouseType={null}
                            setDraggableMarker={null}
                          />
                        </div>
                      )}
                    </For>
                  </Show>
                </div>
              </div>
              <div id="sales-2024">
                <div>
                  <p class="text-2xl">2024 Sales Price Prediction</p>
                </div>
                <div class="text-md">
                  Want to know how much you gonna need to get a residential
                  property at Zipcode {getSelectedZip()} in 2024?{" "}
                  <span
                    class="bg-teal-500 text-white rounded-md px-2 cursor-pointer
                     hover:text-xl  hover:duration-300 ease-in-out
                    hover:scale-100"
                    onClick={() => {
                      draggableMarker().setMap(map());
                    }}
                  >
                    Click here to choose your location!
                  </span>
                </div>
                <div class="flex items-center justify-center">
                  <Show when={uniqueHouseType() && draggableMarker()}>
                    <div
                      class="grid grid-cols-2 divide-x
                    place-content-between w-[90%] my-2"
                    >
                      <div class="flex flex-col gap-2">
                        <div class="grid grid-row-1 divide-y">
                          <div>
                            <p class="text-xl">Location{"   "}</p>
                            <p class="text-sm">
                              To change the location, please move the house icon
                              on the map
                            </p>
                          </div>

                          <div class="flex gap-2">
                            <p>
                              Latitude:{" "}
                              <span class="bg-teal-500 text-white rounded-lg px-2">
                                {lat().toFixed(3)}
                              </span>
                            </p>
                            <p>
                              Longtitude:{" "}
                              <span class="bg-teal-500 text-white rounded-lg px-2">
                                {lon().toFixed(3)}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div class="grid grid-row-1 divide-y">
                          <p class="text-xl">House Details</p>
                          <label for="house_type">House Type:</label>
                          <select
                            id="house_type-p"
                            name="house_type"
                            required
                            class="rounded-md w-full"
                          >
                            <For each={uniqueHouseType()}>
                              {(item) => <option value={item}>{item}</option>}
                            </For>
                          </select>
                          <label for="sqft">Size(sqft):</label>
                          <input
                            type="number"
                            id="size-p"
                            name="size"
                            placeholder="1000"
                            required
                            class="rounded-md w-full"
                          />
                          <label for="bedrooms">Beds:</label>
                          <input
                            type="number"
                            id="bedrooms-p"
                            name="bedrooms"
                            placeholder="1"
                            class="rounded-md w-full"
                            required
                          />
                          <label for="bathrooms">Bath:</label>
                          <input
                            type="number"
                            id="bathrooms-p"
                            name="bathrooms"
                            placeholder="1"
                            required
                            class="rounded-md w-full"
                          />
                        </div>

                        <button
                          class="bg-teal-500 text-white w-[30%]"
                          onClick={handleSubmitPredictedPrice}
                        >
                          Submit
                        </button>
                      </div>

                      <div class="text-xl">
                        The predicted price will be:{" "}
                        <Show when={predictedCost()}>
                          <span>${predictedCost()}</span>
                        </Show>
                      </div>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>

          <div class={mainInfo() === "amenities" ? "" : "hidden"}>
            <p>Amenities Information</p>
            <div class="grid grid-row-1 divide-y w-[90%] items-center m-auto">
              <AmenitiesInfo
                getSelectedZip={getSelectedZip}
                loader={loader}
                highlightMarker={highlightMarker}
                map={map}
              />
            </div>
          </div>

          <div class={mainInfo() === "other" ? "" : "hidden"}>
            <p>Other Information</p>
            <div class="grid grid-row-1 divide-y w-[90%] items-center m-auto">
              <p>Demographic</p>
              <DemographicInfo zip={getSelectedZip} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
