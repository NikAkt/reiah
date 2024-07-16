import { Loader } from "@googlemaps/js-api-loader";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { LineChart } from "./Charts";
import arrow_down from "../assets/down-arrow-backup-2-svgrepo-com.svg";
import arrow_up from "../assets/down-arrow-backup-3-svgrepo-com.svg";

import AmenitiesInfo from "./AmenitiesInfo";
import RealEstateInfo from "./RealEstateInfo";
import DemographicInfo from "./DemographicInfo";

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
  const [show, setShow] = createSignal(true);
  // const [getPropertyPrice, setPropertyPrice] = createSignal([]);

  //show the dropdown menu for users to select the information on the board
  const [displayDropdownMenu, setDisplayDropdownMenu] = createSignal(false);

  //show the type of information on the board
  const [displayContent, setDisplayContent] = createSignal("realEstate");

  const [clean, setClean] = createSignal(false);

  const [showDropDown, setShowDropDown] = createSignal(false);

  //control linecharts
  const [updateLineChart, setUpdateLineChart] = createSignal(false);
  const [cleanLineChart, setCleanLineChart] = createSignal(false);

  //control realestateinfo, amenitiesinfo ...
  const [updateInfo, setUpdateInfo] = createSignal(false);
  //control sliding the multiple information
  const [realEstateCount, setRealEstateCount] = createSignal(0);

  //unique zipcodes that has historical information
  const uniqueZipcode = Object.keys(historicalRealEstateData);

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
  };

  createEffect(() => {
    if (getSelectedZip() !== "") {
      fetchDashboardInfoData("zipcode", getSelectedZip());
    }
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
              <ul
                class="flex w-full px-0 m-0 transition-transform delay-50"
                style={{
                  transform: `translateX(-${realEstateCount() * 100}%)`,
                }}
              >
                <li class="min-w-full">
                  <div id="sales-2023" class="relative w-full">
                    <p>
                      Residential Property Sales(2023){" "}
                      <span>Data Source: Zillow</span>
                    </p>
                    <Show when={updateInfo()}>
                      <div class="flex gap-2">
                        <button class="bg-black text-white px-2">
                          {getSelectedZip()}
                        </button>
                        <For each={getComparedZip()}>
                          {(item, index) => {
                            return (
                              <button class="bg-black text-white px-2">
                                {item}
                              </button>
                            );
                          }}
                        </For>
                      </div>
                    </Show>

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
                    />
                  </div>
                </li>
                <Show when={updateInfo()}>
                  <For each={getComparedZip()}>
                    {(item, index) => (
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
                      />
                    )}
                  </For>
                </Show>
              </ul>

              <div id="sales-2024">
                <div
                  class="hover:text-indigo-600 cursor-pointer w-[85%]
                hover:border-b-2 hover:border-solid hover:border-indigo-600"
                  onClick={() => {}}
                >
                  Want to know the how much you gonna need to get a home in
                  2024?
                </div>
                <div></div>
              </div>
            </div>
          </div>

          <div>
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

          <div>
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
