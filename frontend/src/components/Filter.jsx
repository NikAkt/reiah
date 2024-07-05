import { createSignal, createEffect, onMount } from "solid-js";

const Filter = ({ realEstateData, amenitiesData }) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [applyZip, setApplyZip] = createSignal([]);
  const [boroughData, setBoroughData] = createSignal([]);
  const [selectedZipCodes, setSelectedZipCodes] = createSignal(new Set());

  let avg_home_value = [];
  let median_household_income = [];
  let median_age = [];
  let neighborhood = [];

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  console.log(realEstateData);

  realEstateData.map((el) => {
    avg_home_value.push(el["avg_home_value"]);
    median_household_income.push(el["median_household_income"]);
    median_age.push(el["median_age"]);
    neighborhood.push(el["neighborhood"]);
  });

  const unique_borough = [
    "Bronx",
    "Manhattan",
    "Queens",
    "Brooklyn",
    "Staten Island",
  ];

  const getNeighborhoods = (boroughs) => {
    return [
      ...new Set(
        boroughs.flatMap((borough) =>
          boroughData()
            .filter((el) => el.borough === borough)
            .map((el) => el.neighbourhood)
        )
      ),
    ];
  };

  const getZipcodes = (boroughs) => {
    return [
      ...new Set(
        boroughs.flatMap((borough) =>
          boroughData()
            .filter((el) => el.borough === borough)
            .flatMap((el) => el.zipcodes)
        )
      ),
    ];
  };

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

  const handleBoroughChange = (borough) => {
    setSelectedBoroughs((prev) => {
      const newBoroughs = new Set(prev);
      if (newBoroughs.has(borough)) {
        newBoroughs.delete(borough);
      } else {
        newBoroughs.add(borough);
      }
      return newBoroughs;
    });
  };

  const handleZipCodeChange = (zipCode) => {
    setSelectedZipCodes((prev) => {
      const newZipCodes = new Set(prev);
      if (newZipCodes.has(zipCode)) {
        newZipCodes.delete(zipCode);
      } else {
        newZipCodes.add(zipCode);
      }
      return newZipCodes;
    });
  };

  const handleApplyFilter = () => {
    console.log('Applying filter with selected zip codes:', [...selectedZipCodes()]);
    setApplyZip([...selectedZipCodes()]);
    toggleFilter();
  };

  createEffect(() => {
    const zipcodes = applyZip();
    if (zipcodes.length > 0) {
      console.log('Applying effect with zipcodes:', zipcodes);
      // Highlight the areas on the map based on zipcodes
      // Implement the map highlighting logic here
    }
  });

  onMount(async () => {
    const response = await fetch("http://localhost:8000/api/borough-neighbourhood");
    const data = await response.json();
    setBoroughData(data);
  });

  return (
    <div
      class="absolute z-30 w-full flex flex-col 
    items-center gap-0.5 top-[2vh] left-[50%] transform -translate-x-1/2
     justify-center 
    text-black"
    >
      <button
        class="rounded shadow-md color-zinc-900 cursor-pointer 
        bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center"
        onClick={handleToggleFilter}
      >
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          left-[50%] transform -translate-x-1/2 w-[40vw] h-[80vh] shadow-md
        z-20 items-center delay-[300ms] bg-white 
        animate-fade-down rounded-lg"
        >
          {/* FILTER TITLE */}
          <div
            id="filter-dropdown-title"
            class="items-center justify-center relative
            flex h-[8%] bg-black text-white w-[100%] 
            z-30 flex-row rounded-t-lg"
          >
            <button
              class="absolute rounded-full w-[20px] h-[20px] 
              left-[2%] hover:bg-white
            text-white items-center flex hover:text-black
            justify-center cursor-pointer"
              onClick={toggleFilter}
            >
              <svg
                class="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <p>Filters for {filterTarget()}</p>
          </div>
          {/* FILTER CONTENT */}
          <div
            class="w-[100%] flex flex-col h-[84%] relative
            items-center py-4 px-[10%] gap-y-2.5 bg-white
            overflow-y-auto"
            id="filter-details-container"
          >
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
                </div>

                <div
                  class="flex flex-col items-center 
                  border-solid border-2 border-indigo-600"
                  id="median-income-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Median Household Income
                  </p>
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
                        onChange={() => handleBoroughChange(el)}
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
                    {[...selectedBoroughs()].length > 0 &&
                      getNeighborhoods([...selectedBoroughs()]).map((el) => (
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
                    {[...selectedBoroughs()].length > 0 &&
                      getZipcodes([...selectedBoroughs()]).map((el) => (
                        <div key={el}>
                          <input
                            type="checkbox"
                            value={el}
                            onChange={() => handleZipCodeChange(el)}
                          />
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
                    {Object.keys(amenities_type_desc).map((el) => (
                      <div key={el}>
                        <button
                          class="border-solid border-2 
                    border-indigo-600 rounded-full 
                    bg-blue text-black hover:bg-indigo-600"
                        >
                          {el.toString()}
                        </button>

                        <div class="grid grid-cols-2">
                          {amenities_type_desc[el].map((item) => (
                            <div key={item}>
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
              onClick={() => {
                setSelectedBoroughs(new Set());
                setSelectedZipCodes(new Set());
                setApplyZip([]);
              }}
            >
              Clear all
            </button>
            <button
              class="rounded-2xl  z-20 cursor-pointer
           w-32 h-9 text-white flex items-center justify-center 
           gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 
           focus:outline-none focus:ring focus:ring-violet-300"
              onClick={handleApplyFilter}
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
