import { createSignal } from "solid-js";

const Filter = ({
  realEstateData,
  historicalRealEstateData,
  amenitiesData,
}) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  // let chartInstance = null;
  // let homeValuePlotRef;
  let avg_home_value = [];
  let zipcode = [];
  let median_household_income = [];
  let median_age = [];
  let neighborhood = ["Dumbo", "Harlem"];

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

  const unique_borough = amenitiesData
    ? [...new Set(amenitiesData.map((item) => item["BOROUGH"]))]
    : [];

  const unique_amenity_type = amenitiesData
    ? [...new Set(amenitiesData.map((item) => item["FACILITY_TYPE"]))]
    : [];

  //{recreational facility:['...']}
  let amenities_type_desc = {};
  amenitiesData.map((item) => {
    const { FACILITY_TYPE, FACILITY_DESC } = item;
    if (!amenities_type_desc[FACILITY_TYPE]) {
      amenities_type_desc[FACILITY_TYPE] = [];
    }
    if (!amenities_type_desc[FACILITY_TYPE].includes(FACILITY_DESC)) {
      amenities_type_desc[FACILITY_TYPE].push(FACILITY_DESC);
    }
  });

  console.log(amenities_type_desc);

  const handleToggleFilter = () => {
    toggleFilter();
  };

  return (
    <div
      class="absolute z-30 w-32 flex flex-col 
    items-center gap-0.5 top-[2vh] left-[55vw]
     justify-center
    text-black"
    >
      <button
        class="bg-black rounded-2xl  z-20
        cursor-pointer w-32 h-9 text-white flex 
        items-center justify-center gap-1.5 hover:scale-110 
        duration-300 active:bg-violet-700 focus:outline-none 
        focus:ring focus:ring-violet-300"
        onClick={handleToggleFilter}
      >
        {/* <img src={filter_img} alt="filter" /> */}
        <span>Filter</span>
      </button>
      {/* bg-gradient-to-b from-green to-cyan-500 */}
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          left-[70vw] w-[40vw] h-[80vh] 
        z-20 items-center delay-[300ms] bg-white 
        border-solid border-2 border-red-600
        animate-fade-down"
        >
          {/* /////////// FILTER TITLE ////////////////// */}
          <div
            id="filter-dropdown-title"
            class="items-center justify-center relative
            flex h-[5%] bg-black text-white w-[100%] z-30 
            "
          >
            <p>Filter for {filterTarget()}</p>
          </div>
          {/* /////////// FILTER CONTENNT////////////////// */}
          <div
            class="w-[100%] flex flex-col h-[100%]  relative
            items-center py-[10%] px-[10%] gap-y-2.5 bg-white
            overflow-y-auto"
            id="filter-details-container"
          >
            {/* /////////// MAP FILTER ////////////////// */}

            {/* /////////// PROPERTY FILTER////////////////// */}
            <div
              id="property-filter-container"
              class="flex flex-col items-center border-2 border-indigo-600"
            >
              <p class="font-sans text-2xl font-bold text-black">
                Filter the Area
              </p>

              <div id="property-filter">
                <div
                  class="flex flex-col items-center 
              border-solid border-2 border-indigo-600"
                  id="home-value-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Average Home Value
                  </p>
                  <div>Here should be a chart that looks like airbnb's</div>
                  {/* <ScrollBar /> */}
                  <div class="flex gap-2 ">
                    <div
                      class="flex flex-col w-[35%] h-[10%] 
                border-solid border-2 border-indigo-600 rounded-lg"
                    >
                      <p>Minimum</p>
                      <input
                        type="number"
                        placeholder={`${Math.min(
                          ...avg_home_value
                        ).toString()}`}
                      ></input>
                    </div>
                    <div>---</div>
                    <div
                      class="flex w-[35%] h-[10%] flex-col 
                    border-solid border-2 border-indigo-600 rounded-lg"
                    >
                      <p>Maximum</p>
                      <input
                        type="number"
                        placeholder={`${Math.max(
                          ...avg_home_value
                        ).toString()}`}
                      ></input>
                    </div>
                  </div>
                </div>

                <div
                  class="flex flex-col items-center 
                  border-solid border-2 border-indigo-600"
                  id="median-income-container"
                >
                  {/* <canvas
                ref={(el) => (homeValuePlotRef = el)}
                id="home_value_plot"
              ></canvas> */}
                  <p class="font-sans text-2xl font-bold text-black">
                    Median Household Income
                  </p>
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
                  <label
                    htmlFor="borough-selection"
                    class="font-sans text-2xl font-bold text-black"
                  >
                    Borough:
                  </label>
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
                  <label
                    htmlFor="neighborhood-selection"
                    class="font-sans text-2xl font-bold text-black"
                  >
                    Neighborhood:
                  </label>
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
                  <label
                    htmlFor="zipcode-selection"
                    class="font-sans text-2xl font-bold text-black"
                  >
                    ZIPCODE:
                  </label>
                  <div class="grid grid-cols-5">
                    {zipcode.map((el) => (
                      <div>
                        <input type="checkbox" />
                        <label htmlFor="">{el.toString()}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  id="amenities-container"
                  class="border-solid border-2 border-indigo-600 
              flex flex-col items-center
              justify-center"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Amenities
                  </p>
                  <div class="grid-cols-2">
                    {unique_amenity_type.map((el) => (
                      <div>
                        <button
                          class="border-solid border-2 
                    border-indigo-600 rounded-full 
                    bg-blue text-black hover:bg-indigo-600"
                        >
                          {el.toString()}
                        </button>

                        <div class="grid grid-cols-2">
                          {amenities_type_desc[el].map((item) => (
                            <div>
                              <input type="checkbox" />
                              <label htmlFor="">{item}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="button-container"
            class="items-center 
          justify-center flex gap-4 bottom-[0]
          relative bg-black text-black w-[100%] z-30 
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
           gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 
           focus:outline-none focus:ring focus:ring-violet-300"
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
