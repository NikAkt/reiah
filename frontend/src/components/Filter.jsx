import { createSignal, createEffect, onMount } from "solid-js";

const Filter = ({ realEstateData, amenitiesData }) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [applyZip, setApplyZip] = createSignal([]);
  const [boroughData, setBoroughData] = createSignal([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = createSignal(new Set());
  const [selectedZipCodes, setSelectedZipCodes] = createSignal(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = createSignal(false);

  const unique_borough = [
    "Bronx",
    "Manhattan",
    "Queens",
    "Brooklyn",
    "Staten Island",
  ];

  let avg_home_value = [];
  let median_household_income = [];
  let amenities_type_desc = {};

  realEstateData.forEach((el) => {
    avg_home_value.push(el["avg_home_value"]);
    median_household_income.push(el["median_household_income"]);
  });

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

  const toggleFilter = () => {
    setFilterDisplay(!filterDisplay());
  };

  const handleBoroughChange = (borough) => {
    setSelectedBoroughs((prev) => {
      const newBoroughs = new Set(prev);
      if (newBoroughs.has(borough)) {
        newBoroughs.delete(borough);
      } else {
        newBoroughs.add(borough);
      }
      setSelectedNeighborhoods(new Set()); // Reset neighborhood selection when borough changes
      setSelectedZipCodes(new Set()); // Reset zip code selection when borough changes
      return newBoroughs;
    });
  };

  const handleNeighborhoodChange = (neighborhood) => {
    setSelectedNeighborhoods((prev) => {
      const newNeighborhoods = new Set(prev);
      if (newNeighborhoods.has(neighborhood)) {
        newNeighborhoods.delete(neighborhood);
      } else {
        newNeighborhoods.add(neighborhood);
      }
      setSelectedZipCodes(new Set()); // Reset zip code selection when neighborhood changes
      return newNeighborhoods;
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

  const handleSelectAllZipCodes = (event) => {
    if (event.target.checked) {
      const allZipCodes = getZipcodes([...selectedBoroughs()], [...selectedNeighborhoods()]);
      setSelectedZipCodes(new Set(allZipCodes));
    } else {
      setSelectedZipCodes(new Set());
    }
  };

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

  const getZipcodes = (boroughs, neighborhoods) => {
    return [
      ...new Set(
        boroughs.flatMap((borough) =>
          boroughData()
            .filter((el) => el.borough === borough && (neighborhoods.length === 0 || neighborhoods.includes(el.neighbourhood)))
            .flatMap((el) => el.zipcodes)
        )
      ),
    ];
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
        onClick={toggleFilter}
      >
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          left-[50%] transform -translate-x-1/2 w-[40vw] h-auto shadow-md
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
            class="w-[100%] flex flex-col h-auto relative
            items-center py-4 px-[10%] gap-y-2.5 bg-white"
            id="filter-details-container"
          >
            {/* Borough Selection */}
            <div id="borough-selection-container" class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg">
              <label htmlFor="borough-selection" class="font-sans text-2xl font-bold text-black">
                Borough:
              </label>
              {unique_borough.map((el) => (
                <div key={el}>
                  <input
                    name="borough-selection"
                    value={el.toString()}
                    type="checkbox"
                    onChange={() => handleBoroughChange(el)}
                    checked={selectedBoroughs().has(el)}
                  />
                  <label htmlFor="borough-selection">{el.toString()}</label>
                </div>
              ))}
            </div>

            {/* Neighborhood Selection */}
            {[...selectedBoroughs()].length > 0 && (
              <div id="neighborhood-container" class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg">
                <label htmlFor="neighborhood-selection" class="font-sans text-2xl font-bold text-black">
                  Neighborhood:
                </label>
                <div class="w-full h-32 overflow-y-auto border border-gray-300 rounded-md">
                  {getNeighborhoods([...selectedBoroughs()]).map((el) => (
                    <div
                      key={el}
                      class={`p-2 cursor-pointer ${selectedNeighborhoods().has(el) ? 'bg-indigo-600 text-white' : 'bg-white text-black'}`}
                      onClick={() => handleNeighborhoodChange(el)}
                    >
                      {el}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zipcode Selection */}
            {[...selectedNeighborhoods()].length > 0 && (
              <div id="zipcode-selection-container" class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg">
                <label htmlFor="zipcode-selection" class="font-sans text-2xl font-bold text-black">
                  ZIPCODE:
                </label>
                <div class="grid grid-cols-5">
                  <div>
                    <input type="checkbox" onChange={handleSelectAllZipCodes} />
                    <label htmlFor="">All</label>
                  </div>
                  {getZipcodes([...selectedBoroughs()], [...selectedNeighborhoods()]).map((el) => (
                    <div key={el}>
                      <input
                        type="checkbox"
                        value={el}
                        onChange={() => handleZipCodeChange(el)}
                        checked={selectedZipCodes().has(el)}
                      />
                      <label htmlFor="">{el.toString()}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters Button */}
            {selectedZipCodes().size > 0 && (
              <>
                <button
                  class="mt-4 p-2 bg-indigo-600 text-white rounded"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}
                >
                  {showAdvancedFilters() ? "Hide Advanced Filters" : "Show Advanced Filters"}
                </button>

                <button
                  class="mt-4 p-2 bg-indigo-600 text-white rounded"
                  onClick={handleApplyFilter}
                >
                  Apply
                </button>
              </>
            )}

            {/* Advanced Filters */}
            {showAdvancedFilters() && (
              <div id="advanced-filters-container" class="w-full p-4 border-solid border-2 border-indigo-600 rounded-lg mt-4">
                <div
                  class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg"
                  id="home-value-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Average Home Value
                  </p>
                  <div
                    class="relative w-[90%] h-[100%] border-2 border-dashed border-indigo-600 items-center"
                  >
                    {/* <ColChart data={avg_home_value} /> */}
                  </div>
                </div>

                <div
                  class="flex flex-col items-center border-solid border-2 border-indigo-600 p-2 rounded-lg mt-4"
                  id="median-income-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Median Household Income
                  </p>
                  <div class="flex gap-2 ">
                    <div class="flex flex-col w-[35%] h-[10%] border-solid border-2 border-indigo-600 rounded-lg">
                      <p>Minimum</p>
                      <input
                        type="number"
                        placeholder={`${Math.min(...median_household_income).toString()}`}
                      ></input>
                    </div>
                    <div>---</div>
                    <div class="flex w-[35%] h-[10%] flex-col border-solid border-2 border-indigo-600 rounded-lg">
                      <p>Maximum</p>
                      <input
                        type="number"
                        placeholder={`${Math.max(...median_household_income).toString()}`}
                      ></input>
                    </div>
                  </div>
                </div>

                <div
                  id="amenities-container"
                  class="border-solid border-2 border-indigo-600 flex flex-col items-center justify-center p-2 rounded-lg mt-4"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Amenities
                  </p>
                  <div class="grid-cols-2">
                    {Object.keys(amenities_type_desc).map((el) => (
                      <div key={el}>
                        <button class="border-solid border-2 border-indigo-600 rounded-full bg-blue text-black hover:bg-indigo-600">
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
            )}
          </div>

          {/* Apply and Clear Buttons */}
          <div
            id="button-container"
            class="items-center justify-center flex gap-4 bottom-[0] h-[8%] relative bg-black text-black w-[100%] z-30 border-solid border-2 border-indigo-600 rounded-b-lg"
          >
            <button
              class="rounded-2xl z-20 cursor-pointer w-32 h-9 text-white flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
              onClick={() => {
                setSelectedBoroughs(new Set());
                setSelectedNeighborhoods(new Set());
                setSelectedZipCodes(new Set());
                setApplyZip([]);
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
