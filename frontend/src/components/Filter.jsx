import { createSignal, onCleanup, onMount } from "solid-js";
// import filter_img from "/assets/icon/Filter.png";
import MapFilter from "./MapFilter";
import Chart from "chart.js/auto";

const Filter = ({
  realEstateData,
  historicalRealEstateData,
  amenitiesData,
}) => {
  const [filterDisplay, setFilterDisplay] = createSignal(true);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  // let chartInstance = null;
  // let homeValuePlotRef;
  let avg_home_value = [];
  let zipcode = [];
  let median_household_income = [];
  let median_age = [];
  let neighborhood = ["Dumbo", "Harlem"];
  console.log(neighborhood);

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  const parseData = (data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse data:", e);
      return [];
    }
  };

  realEstateData = parseData(realEstateData);
  historicalRealEstateData = parseData(historicalRealEstateData);
  amenitiesData = parseData(amenitiesData);

  realEstateData.map((el) => {
    avg_home_value.push(el["avg_home_value"]);
    zipcode.push(el["zipcode"]);
    median_household_income.push(el["median_household_income"]);
    median_age.push(el["median_age"]);
  });

  console.log("zipcode", zipcode.length);

  const unique_borough = amenitiesData
    ? [...new Set(amenitiesData.map((item) => item["BOROUGH"]))]
    : [];

  const unique_amenity_type = amenitiesData
    ? [...new Set(amenitiesData.map((item) => item["FACILITY_DESC"]))]
    : [];

  // const plotHomeValue = () => {
  //   const ctx = homeValuePlotRef;
  //   if (ctx) {
  //     chartInstance = new Chart(ctx, {
  //       type: "bar",
  //       data: {
  //         labels: realEstateData.map((obj) => obj["avg_home_value"]),
  //         datasets: [
  //           {
  //             label: "Average Home Value Plot",
  //             data: avg_home_value,
  //           },
  //         ],
  //       },
  //     });
  //   } else {
  //     console.error("Element with ref 'homeValuePlotRef' not found.");
  //   }
  // };

  // onMount(() => {
  //   // Plot the chart if the filter is already displayed on mount
  //   if (filterDisplay()) {
  //     plotHomeValue();
  //   }
  // });

  // onCleanup(() => {
  //   // Clean up the chart instance when the component is unmounted or filter is toggled off
  //   if (chartInstance) {
  //     chartInstance.destroy();
  //     chartInstance = null;
  //   }
  // });

  const handleToggleFilter = () => {
    // const wasDisplayed = filterDisplay();
    toggleFilter();
    // If the filter was not displayed before, wait for the DOM to update, then plot the chart
    // if (!wasDisplayed) {
    //   setTimeout(plotHomeValue, 0); // Using 0 timeout to wait for next tick
    // } else {
    //   // If the filter is being hidden, clean up the chart
    //   if (chartInstance) {
    //     chartInstance.destroy();
    //     chartInstance = null;
    //   }
    // }
  };

  return (
    <div
      class="absolute z-30 w-32 flex flex-col 
    items-center gap-0.5 mt-[11vh] ml-[42vw]
    border-solid border-2 border-indigo-600"
      justify-center
    >
      <button
        class="bg-black rounded-2xl  z-20
        cursor-pointer w-32 h-9 text-white flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
        onClick={handleToggleFilter}
      >
        {/* <img src={filter_img} alt="filter" /> */}
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          left-[70vw] w-[30vw] bg-white h-[80vh] 
        z-20 items-center delay-[300ms] 
        animate-fade-down"
        >
          <div
            id="filter-dropdown-title"
            class="items-center justify-center
            flex fixed h-[5%] bg-black text-white w-[100%] z-30 
            border-solid border-2 border-green"
          >
            <p>Filter for {filterTarget()}</p>
          </div>
          <div
            class="w-[100%] flex flex-col h-[100%] 
            items-center py-[10%] px-[10%] gap-y-2.5 
            overflow-y-auto border-2 border-indigo-600 bg-green"
            id="filter-details-container"
          >
            <div
              id="map-filter-container"
              class="w-[90%] flex flex-col items-center 
              border-solid border-2 border-indigo-600"
            >
              <p>Map Filter</p>
              <MapFilter />
            </div>

            <div
              class="flex flex-col items-center 
              border-solid border-2 border-indigo-600"
              id="home-value-container"
            >
              {/* <canvas
                ref={(el) => (homeValuePlotRef = el)}
                id="home_value_plot"
              ></canvas> */}
              <p class="font-sans text-4xl">Home Value</p>
              <div>Here should be a chart that looks like airbnb's</div>
              <div class="flex gap-2 ">
                <div
                  class="flex flex-col w-[35%] h-[10%] 
                border-solid border-2 border-indigo-600 rounded-lg"
                >
                  <p>Minimum</p>
                  <input
                    type="number"
                    placeholder={`${Math.min(...avg_home_value).toString()}`}
                  ></input>
                </div>
                <div>---</div>
                <div class="flex w-[35%] h-[10%] flex-col border-solid border-2 border-indigo-600 rounded-lg">
                  <p>Maximum</p>
                  <input
                    type="number"
                    placeholder={`${Math.max(...avg_home_value).toString()}`}
                  ></input>
                </div>
              </div>
            </div>

            <div
              class="flex flex-col items-center border-solid border-2 border-indigo-600"
              id="median-income-container"
            >
              {/* <canvas
                ref={(el) => (homeValuePlotRef = el)}
                id="home_value_plot"
              ></canvas> */}
              <p>Median Household Income</p>
              <div>Here should be a chart that looks like airbnb's</div>
              <div class="flex gap-2 ">
                <div
                  class="flex flex-col w-[35%] h-[10%] 
                border-solid border-2 border-indigo-600 rounded-lg"
                >
                  <p>Minimum</p>
                  <input
                    type="number"
                    placeholder={`${Math.min(
                      ...median_household_income
                    ).toString()}`}
                  ></input>
                </div>
                <div>---</div>
                <div class="flex w-[35%] h-[10%] flex-col border-solid border-2 border-indigo-600 rounded-lg">
                  <p>Maximum</p>
                  <input
                    type="number"
                    placeholder={`${Math.max(
                      ...median_household_income
                    ).toString()}`}
                  ></input>
                </div>
              </div>
            </div>

            <div
              id="borough-selection-container"
              class="border-solid border-2 border-indigo-600"
            >
              <label htmlFor="borough-selection">Borough:</label>
              {unique_borough.map((el) => (
                <>
                  <input
                    name="borough-selection"
                    value={el.toString()}
                    type="checkbox"
                  />
                  <label htmlFor="borough-selection">{el.toString()}</label>
                </>
              ))}
            </div>

            <div
              id="neighborhood-container"
              class="border-solid border-2 border-indigo-600"
            >
              <label htmlFor="neighborhood-selection">Neighborhood:</label>
              <select name="neighborhood" id="neighborhood">
                {neighborhood.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </div>

            <div
              id="zipcode-selection-container"
              class="border-solid border-2 border-indigo-600"
            >
              <label htmlFor="zipcode-selection">ZIPCODE:</label>
              <select name="zipcode" id="zipcode">
                {zipcode.map((el) => (
                  <option value={el.toString()}>{el.toString()}</option>
                ))}
              </select>
            </div>
            <div
              id="amenities-container"
              class="border-solid border-2 border-indigo-600"
            >
              <p>Amenities</p>
              <select name="amenities" id="amenities">
                {unique_amenity_type.map((el) => (
                  <option value={el.toString()}>{el.toString()}</option>
                ))}
              </select>
            </div>
          </div>
          <div
            id="button-container"
            class="items-center 
          justify-center flex gap-4 bottom-[0]
          fixed bg-black text-white w-[100%] z-30 
          border-solid border-2 border-indigo-600"
          >
            <button
              class="rounded-2xl  z-20 cursor-pointer
           w-32 h-9 text-white flex items-center justify-center 
           gap-1.5 hover:scale-110 duration-300 
           active:bg-violet-700 focus:outline-none focus:ring 
           focus:ring-violet-300"
            >
              Clear all
            </button>
            <button
              class="rounded-2xl  z-20 cursor-pointer
           w-32 h-9 text-white flex items-center justify-center 
           gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
