import { createSignal, createEffect, onMount } from "solid-js";

// Debounce function to limit API calls
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const Filter = ({ realEstateDataProp, setFilteredZipCodes }) => {
  const [filterDisplay, setFilterDisplay] = createSignal(false);
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [selectedNeighborhoods, setSelectedNeighborhoods] = createSignal(new Set());
  const [boroughData, setBoroughData] = createSignal([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = createSignal(false);
  const [selectedAmenities, setSelectedAmenities] = createSignal(new Set());
  const [filteredAmenities, setFilteredAmenities] = createSignal({});
  const [avgHomeValueRange, setAvgHomeValueRange] = createSignal([0, 0]);
  const [medianHouseholdIncomeRange, setMedianHouseholdIncomeRange] = createSignal([0, 0]);
  const [filteredZipCodesLocal, setFilteredZipCodesLocal] = createSignal([]);
  const [realEstateData, setRealEstateData] = createSignal([]);

  const unique_borough = ["Bronx", "Manhattan", "Queens", "Brooklyn", "Staten Island"];

  const fetchBoroughData = async () => {
    const response = await fetch("http://localhost:8000/api/borough-neighbourhood");
    const data = await response.json();
    setBoroughData(data);
  };

  const fetchRealEstateData = async () => {
    const response = await fetch("http://localhost:8000/api/prices");
    const data = await response.json();
    setRealEstateData(data);
  };

  const fetchAmenities = debounce(async (neighborhoods) => {
    if (neighborhoods.length > 0) {
      const neighborhoodParams = neighborhoods.join(",");
      const response = await fetch(`http://localhost:8000/api/amenities?neighborhoods=${neighborhoodParams}`);
      const data = await response.json();
      setFilteredAmenities(data);
    } else {
      setFilteredAmenities({});
    }
  }, 300);

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
      return newNeighborhoods;
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

  const applyFilters = () => {
    let zipCodes = getZipcodes([...selectedBoroughs()], [...selectedNeighborhoods()]);

    if (avgHomeValueRange()[0] > 0 || avgHomeValueRange()[1] > 0) {
      zipCodes = zipCodes.filter((zip) => {
        const homeValue = getHomeValue(zip);
        return homeValue >= avgHomeValueRange()[0] && homeValue <= avgHomeValueRange()[1];
      });
    }

    if (medianHouseholdIncomeRange()[0] > 0 || medianHouseholdIncomeRange()[1] > 0) {
      zipCodes = zipCodes.filter((zip) => {
        const income = getMedianIncome(zip);
        return income >= medianHouseholdIncomeRange()[0] && income <= medianHouseholdIncomeRange()[1];
      });
    }

    if (selectedAmenities().size > 0) {
      zipCodes = zipCodes.filter((zip) => {
        const amenities = filteredAmenities()[zip] || [];
        return [...selectedAmenities()].every((amenity) =>
          amenities.some((a) => a.FACILITY_DOMAIN_NAME === amenity)
        );
      });
    }

    setFilteredZipCodesLocal(zipCodes);
    setFilteredZipCodes(zipCodes); // Update the global filtered zip codes
    fetchAmenities([...selectedNeighborhoods()]);
  };

  createEffect(() => {
    applyFilters();
  });

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

  const getHomeValue = (zip) => {
    const data = realEstateData().find((el) => el.zipcode === zip);
    return data ? data.avg_home_value : 0;
  };

  const getMedianIncome = (zip) => {
    const data = realEstateData().find((el) => el.zipcode === zip);
    return data ? data.median_household_income : 0;
  };

  const highlightZipCodesOnMap = (zipCodes) => {
    setFilteredZipCodes(zipCodes); // Update the global filtered zip codes
    console.log("Highlighting zip codes on map:", zipCodes);
    toggleFilter();
  };

  onMount(() => {
    fetchBoroughData();
    fetchRealEstateData();
  });

  const uniqueAmenities = () => {
    const amenitiesSet = new Set();
    Object.keys(filteredAmenities()).forEach((zipCode) => {
      filteredAmenities()[zipCode].forEach((item) => {
        amenitiesSet.add(item.FACILITY_DOMAIN_NAME);
      });
    });
    return Array.from(amenitiesSet);
  };

  return (
    <div class="absolute z-10 w-[80vw] flex flex-col items-center gap-0.5 top-[2vh] left-[10vw] justify-center text-black pointer-events-none">
      <button class="rounded shadow-md color-zinc-900 cursor-pointer bg-white text-base mt-4 mx-6 mb-6 leading-9 py-0 px-2 text-center pointer-events-auto" onClick={toggleFilter}>
        <span>Filter</span>
      </button>
      {filterDisplay() && (
        <div class="grid-cols-1 divide-y m-0 px-0 mt-[-2vh] w-full max-h-[80vh] shadow-md z-20 items-center bg-white animate-fade-down rounded-lg transition-all duration-500 overflow-y-auto relative pointer-events-auto">
          {/* FILTER TITLE */}
          <div id="filter-dropdown-title" class="items-center justify-center relative flex h-[8%] bg-black text-white w-[100%] z-30 flex-row rounded-t-lg" style="position: sticky; top: 0; height: 56px;">
            <button class="absolute rounded-full w-[20px] h-[20px] left-[2%] hover:bg-white text-white items-center flex hover:text-black justify-center cursor-pointer" onClick={toggleFilter}>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p>Filters for {filterTarget()}</p>
          </div>
          {/* FILTER CONTENT */}
          <div class="w-[100%] flex flex-col h-auto relative items-center py-4 px-[10%] gap-y-2.5 bg-white" id="filter-details-container">
            {/* Borough Selection */}
            <div id="borough-selection-container" class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg transition-all duration-500">
              <label htmlFor="borough-selection" class="font-sans text-2xl font-bold text-black">Borough:</label>
              <div class="flex flex-wrap gap-2">
                {unique_borough.map((el) => (
                  <div key={el} class="flex items-center">
                    <input name="borough-selection" value={el.toString()} type="checkbox" onChange={() => handleBoroughChange(el)} checked={selectedBoroughs().has(el)} />
                    <label htmlFor="borough-selection" class="ml-2">{el.toString()}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Selection */}
            {[...selectedBoroughs()].length > 0 && (
              <div class="border-solid border-2 border-indigo-600 w-full p-4 rounded-lg transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="neighborhood-container">
                <label htmlFor="neighborhood-selection" class="font-sans text-2xl font-bold text-black">Neighborhood:</label>
                <div class="w-full h-32 overflow-y-auto border border-gray-300 rounded-md">
                  {getNeighborhoods([...selectedBoroughs()]).map((el) => (
                    <div key={el} class={`p-2 cursor-pointer ${selectedNeighborhoods().has(el) ? 'bg-indigo-600 text-white' : 'bg-white text-black'}`} onClick={() => handleNeighborhoodChange(el)}>{el}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters Button */}
            {selectedNeighborhoods().size > 0 && (
              <button class="mt-4 p-2 bg-indigo-600 text-white rounded transition-all duration-500 ease-in-out transform" onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}>
                {showAdvancedFilters() ? "Hide Advanced Filters" : "Show Advanced Filters"}
              </button>
            )}

            {/* Advanced Filters */}
            {showAdvancedFilters() && (
              <div class="w-full p-4 border-solid border-2 border-indigo-600 rounded-lg mt-4 flex flex-col transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="advanced-filters-container">
                <div class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg" id="home-value-container">
                  <p class="font-sans text-2xl font-bold text-black">Average Home Value</p>
                  <div class="flex gap-2 w-full">
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Minimum</p>
                      <input type="number" value={avgHomeValueRange()[0]} onChange={(e) => setAvgHomeValueRange([Number(e.target.value), avgHomeValueRange()[1]])} />
                    </div>
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Maximum</p>
                      <input type="number" value={avgHomeValueRange()[1]} onChange={(e) => setAvgHomeValueRange([avgHomeValueRange()[0], Number(e.target.value)])} />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg" id="median-income-container">
                  <p class="font-sans text-2xl font-bold text-black">Median Household Income</p>
                  <div class="flex gap-2 w-full">
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Minimum</p>
                      <input type="number" value={medianHouseholdIncomeRange()[0]} onChange={(e) => setMedianHouseholdIncomeRange([Number(e.target.value), medianHouseholdIncomeRange()[1]])} />
                    </div>
                    <div class="flex flex-col w-full border-solid border-2 border-indigo-600 rounded-lg p-2">
                      <p>Maximum</p>
                      <input type="number" value={medianHouseholdIncomeRange()[1]} onChange={(e) => setMedianHouseholdIncomeRange([medianHouseholdIncomeRange()[0], Number(e.target.value)])} />
                    </div>
                  </div>
                </div>

                <div id="amenities-container" class="flex flex-col items-center justify-center border-solid border-2 border-indigo-600 p-2 rounded-lg">
                  <p class="font-sans text-2xl font-bold text-black">Amenities</p>
                  <div class="grid grid-cols-2 w-full gap-2">
                    {uniqueAmenities().map((item) => (
                      <div key={item} class="flex items-center">
                        <input type="checkbox" value={item} onChange={() => handleAmenityChange(item)} checked={selectedAmenities().has(item)} />
                        <label htmlFor={item} class="ml-2">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clear Button and Filter Results */}
          <div id="button-container" class="items-center justify-center flex gap-4 bg-black text-white w-[100%] z-30 border-solid border-2 border-indigo-600 rounded-b-lg p-4 pointer-events-auto" style="position: sticky; bottom: 0; height: 56px;">
            <button class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300" onClick={() => {
              setSelectedBoroughs(new Set());
              setSelectedNeighborhoods(new Set());
              setSelectedAmenities(new Set());
              setFilteredZipCodes([]);
              setShowAdvancedFilters(false);
              setFilteredAmenities({});
            }}>
              Clear all
            </button>

            {filteredZipCodesLocal().length === 0 ? (
              <span class="text-red-500">Change filters</span>
            ) : (
              <div class="flex items-center gap-2">
                <span>Filters result in {filteredZipCodesLocal().length} zipcodes</span>
                <button class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300" onClick={() => highlightZipCodesOnMap(filteredZipCodesLocal())}>
                  See on Map
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
