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
  const [selectedAmenities, setSelectedAmenities] = createSignal(new Set());

  const [avgHomeValueRange, setAvgHomeValueRange] = createSignal([0, 0]);
  const [medianHouseholdIncomeRange, setMedianHouseholdIncomeRange] = createSignal([0, 0]);

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

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) => {
      const newAmenities = new Set(prev);
      if (newAmenities.has(amenity)) {
        newAmenities.delete(amenity);
      } else {
        newAmenities.add(amenity);
      }
      return newAmenities;
    });
  };

  const handleApplyFilter = () => {
    console.log('Applying filter with selected zip codes:', [...selectedZipCodes()]);
    console.log('Applying advanced filters:', {
      avgHomeValueRange: avgHomeValueRange(),
      medianHouseholdIncomeRange: medianHouseholdIncomeRange(),
      amenities: [...selectedAmenities()]
    });
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
      class="absolute z-10 w-[80vw] flex flex-col 
    items-center gap-0.5 top-[2vh] left-[10vw] 
    justify-center 
    text-black pointer-events-none"
    >
      <button
        class="rounded shadow-md color-zinc-900 cursor-pointer 
        bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center pointer-events-auto"
        onClick={toggleFilter}
      >
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div
          class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] 
          w-full max-h-[80vh] shadow-md
        z-20 items-center bg-white 
        animate-fade-down rounded-lg transition-all duration-500 overflow-y-auto relative pointer-events-auto"
        >
          {/* FILTER TITLE */}
          <div
            id="filter-dropdown-title"
            class="items-center justify-center relative
            flex h-[8%] bg-black text-white w-[100%] 
            z-30 flex-row rounded-t-lg"
            style="position: sticky; top: 0; height: 56px;"
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
            <div id="borough-selection-container" class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg transition-all duration-500">
              <label htmlFor="borough-selection" class="font-sans text-2xl font-bold text-black">
                Borough:
              </label>
              <div class="flex flex-wrap gap-2">
                {unique_borough.map((el) => (
                  <div key={el} class="flex items-center">
                    <input
                      name="borough-selection"
                      value={el.toString()}
                      type="checkbox"
                      onChange={() => handleBoroughChange(el)}
                      checked={selectedBoroughs().has(el)}
                    />
                    <label htmlFor="borough-selection" class="ml-2">{el.toString()}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Selection */}
            {[...selectedBoroughs()].length > 0 && (
              <div class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="neighborhood-container">
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
              <div class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="zipcode-selection-container">
                <label htmlFor="zipcode-selection" class="font-sans text-2xl font-bold text-black">
                  ZIPCODE:
                </label>
                <div class="grid grid-cols-5 overflow-y-auto h-32">
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
              <button
                class="mt-4 p-2 bg-indigo-600 text-white rounded transition-all duration-500 ease-in-out transform"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}
              >
                {showAdvancedFilters() ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </button>
            )}

            {/* Advanced Filters */}
            {showAdvancedFilters() && (
              <div class="w-full p-4 border-solid border-2 border-indigo-600 rounded-lg mt-4 flex flex-col transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="advanced-filters-container">
                <div
                  class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg"
                  id="home-value-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Average Home Value
                  </p>
                  <div class="flex gap-2 w-full">
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Minimum</p>
                      <input
                        type="number"
                        value={avgHomeValueRange()[0]}
                        onChange={(e) => setAvgHomeValueRange([Number(e.target.value), avgHomeValueRange()[1]])}
                      />
                    </div>
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Maximum</p>
                      <input
                        type="number"
                        value={avgHomeValueRange()[1]}
                        onChange={(e) => setAvgHomeValueRange([avgHomeValueRange()[0], Number(e.target.value)])}
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg"
                  id="median-income-container"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Median Household Income
                  </p>
                  <div class="flex gap-2 w-full">
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Minimum</p>
                      <input
                        type="number"
                        value={medianHouseholdIncomeRange()[0]}
                        onChange={(e) => setMedianHouseholdIncomeRange([Number(e.target.value), medianHouseholdIncomeRange()[1]])}
                      />
                    </div>
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Maximum</p>
                      <input
                        type="number"
                        value={medianHouseholdIncomeRange()[1]}
                        onChange={(e) => setMedianHouseholdIncomeRange([medianHouseholdIncomeRange()[0], Number(e.target.value)])}
                      />
                    </div>
                  </div>
                </div>

                <div
                  id="amenities-container"
                  class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg"
                >
                  <p class="font-sans text-2xl font-bold text-black">
                    Amenities
                  </p>
                  <div class="grid grid-cols-2 w-full gap-2">
                    {Object.keys(amenities_type_desc).flatMap((el) =>
                      amenities_type_desc[el].map((item) => (
                        <div key={item} class="flex items-center">
                          <input
                            type="checkbox"
                            value={item}
                            onChange={() => handleAmenityChange(item)}
                            checked={selectedAmenities().has(item)}
                          />
                          <label htmlFor={item} class="ml-2">{item}</label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Apply and Clear Buttons */}
          <div
            id="button-container"
            class="items-center justify-center flex gap-4 bg-black text-white w-[100%] z-30 border-solid border-2 border-indigo-600 rounded-b-lg p-4 pointer-events-auto"
            style="position: sticky; bottom: 0; height: 56px;"
          >
            <button
              class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
              onClick={() => {
                setSelectedBoroughs(new Set());
                setSelectedNeighborhoods(new Set());
                setSelectedZipCodes(new Set());
                setSelectedAmenities(new Set());
                setApplyZip([]);
                setShowAdvancedFilters(false);
              }}
            >
              Clear all
            </button>

            <button
              class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
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
