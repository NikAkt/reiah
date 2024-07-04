import { createSignal } from "solid-js";
import { ColChart } from "./ColChart";
import { AirBNBSlider } from "./AirBNBSlider";

const Filter = ({ realEstateData, amenitiesData }) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  let avg_home_value = [];
  let zipcode = [];
  let median_household_income = [];
  let median_age = [];
  let neighborhood = [];

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  console.log(realEstateData);

  realEstateData.map((el) => {
    avg_home_value.push(el["avg_home_value"]);
    zipcode.push(el["zipcode"]);
    median_household_income.push(el["median_household_income"]);
    median_age.push(el["median_age"]);
  });

  const unique_borough = [
    "Broxn",
    "Manhattan",
    "Queens",
    "Brooklyn",
    "Staten Island",
  ];

  let amenities_type_desc = {};

  for (let key of Object.keys(amenitiesData)) {
    const obj = amenitiesData[key];
    obj.forEach((arr) => {
      if (!amenities_type_desc.hasOwnProperty(arr["FACILITY_T"])) {
        amenities_type_desc[arr["FACILITY_T"]] = [];
      }
      if (
        !amenities_type_desc[arr["FACILITY_T"]].includes(
          arr["FACILITY_DOMAIN_NAME"]
        )
      ) {
        amenities_type_desc[arr["FACILITY_T"]].push(
          arr["FACILITY_DOMAIN_NAME"]
        );
      }
    });
  }

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
        class="rounded shadow-md color-zinc-900 cursor-pointer 
        bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center"
        onClick={handleToggleFilter}
      >
        {/* <img src={filter_img} alt="filter" /> */}
        <span>Filter</span>
      </button>
      {/* bg-gradient-to-b from-green to-cyan-500 */}
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          left-[70vw] w-[40vw] h-[80vh] shadow-md
        z-20 items-center delay-[300ms] bg-white 
        animate-fade-down rounded-lg"
        >
          {/* /////////// FILTER TITLE ////////////////// */}
          <div
            id="filter-dropdown-title"
            class="items-center justify-center relative
            flex h-[8%] bg-black text-white w-[100%] 
            z-30 flex-row rounded-t-lg
            "
          >
            <button
              class="absolute rounded-full w-[20px] h-[20px] 
              left-[2%] hover:bg-white
            text-white items-center flex hover:text-black
            justify-center cursor-pointer"
              onClick={toggleFilter}
            >
              X
            </button>
            <p>Filters for {filterTarget()}</p>
          </div>
          {/* /////////// FILTER CONTENNT////////////////// */}
          <div
            class="w-[100%] flex flex-col h-[84%] relative
            items-center py-4 px-[10%] gap-y-2.5 bg-white
            overflow-y-auto"
            id="filter-details-container"
          >
            {/* /////////// MAP FILTER ////////////////// */}

            {/* /////////// PROPERTY FILTER////////////////// */}
            <div
              id="property-filter-container"
              class="flex flex-col items-center "
            >
              <div id="property-filter">
                <div
                  class="flex flex-col items-center justify-center
              border-solid border-2 border-indigo-600"
                  id="home-value-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Average Home Value
                  </p>
                  <div
                    class="relative w-[90%] h-[100%] 
                  border-2 border-dashed border-indigo-600 items-center"
                  >
                    {/* <ColChart data={avg_home_value} /> */}
                  </div>
                  <div class="flex gap-2 items-center justify-center">
                    {/* <div
                      class="flex flex-col w-[35%] h-[10%] 
                border-solid border-2 border-[#dddddd] rounded-lg
                items-center"
                    >
                      <p>Minimum</p>
                      <input
                        class="relative w-[80%] text-center"
                        type="number"
                        placeholder={`${Math.min(
                          ...avg_home_value
                        ).toString()}`}
                      ></input>
                    </div>
                    <div>---</div>
                    <div
                      class="flex w-[35%] h-[10%] flex-col 
                    border-solid border-2 border-[border-[#dddddd]] rounded-lg items-center"
                    >
                      <p>Maximum</p>
                      <input
                        class="relative w-[80%] text-center"
                        type="number"
                        placeholder={`${Math.max(
                          ...avg_home_value
                        ).toString()}`}
                      ></input>
                    </div> */}
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
                  <div>{/* <ColChart data={median_household_income} /> */}</div>
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
                    {Object.keys(amenities_type_desc).forEach((el) => (
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
          justify-center flex gap-4 bottom-[0] h-[8%]
          relative bg-black text-black w-[100%] z-30 
          border-solid border-2 border-indigo-600 rounded-b-lg"
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
