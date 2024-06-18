import { createSignal, onCleanup, onMount } from "solid-js";
// import filter_img from "/assets/icon/Filter.png";
import MapFilter from "./MapFilter";
import Chart from "chart.js/auto";

const Filter = ({ realEstateData, historicalRealEstateData }) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  let chartInstance = null;
  let homeValuePlotRef;
  let avg_home_value = [];
  let zipcode = [];
  let median_household_income = [];
  let median_age = [];

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

  realEstateData.map((el) => {
    avg_home_value.push(el["avg_home_value"]);
    zipcode.push(el["zipcode"]);
    median_household_income.push(el["median_household_income"]);
    median_age.push(el["median_age"]);
  });

  // const unique_zipCode = realEstateData
  //   ? [...new Set(realEstateData.map((item) => item["zipcode"]))]
  //   : [];

  const plotHomeValue = () => {
    const ctx = homeValuePlotRef;
    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: realEstateData.map((obj) => obj["avg_home_value"]),
          datasets: [
            {
              label: "Average Home Value Plot",
              data: avg_home_value,
            },
          ],
        },
      });
    } else {
      console.error("Element with ref 'homeValuePlotRef' not found.");
    }
  };

  onMount(() => {
    // Plot the chart if the filter is already displayed on mount
    if (filterDisplay()) {
      plotHomeValue();
    }
  });

  onCleanup(() => {
    // Clean up the chart instance when the component is unmounted or filter is toggled off
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  const handleToggleFilter = () => {
    const wasDisplayed = filterDisplay();
    toggleFilter();
    // If the filter was not displayed before, wait for the DOM to update, then plot the chart
    if (!wasDisplayed) {
      setTimeout(plotHomeValue, 0); // Using 0 timeout to wait for next tick
    } else {
      // If the filter is being hidden, clean up the chart
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
    }
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
          class="m-0 px-0 mt-[-2vh] left-[70vw] w-[30vw] bg-white h-[80vh] 
        z-20 flex flex-col items-center delay-[300ms] animate-fade-down overflow-y-auto"
        >
          <p>Filter</p>
          <div class="w-[90%] flex flex-col h-[100%] items-center">
            <p>Map Filter</p>
            {/* <MapFilter /> */}
            <div class="flex flex-col items-center">
              <p>Home value</p>
              <canvas
                ref={(el) => (homeValuePlotRef = el)}
                id="home_value_plot"
              ></canvas>
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

            <p>Median Income</p>
            <div id="median_income_plot"></div>
            <p>Borough</p>
            <p>Neighbourhood</p>
            <div>
              <p>Zip Code</p>
              <label htmlFor="zipcode-selection">ZIPCODE:</label>
              <select name="zipcode" id="zipcode">
                {zipcode.map((el) => (
                  <option value={el.toString()}>{el.toString()}</option>
                ))}
              </select>
            </div>

            <p>Amenities</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
