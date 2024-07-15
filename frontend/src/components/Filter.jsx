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

const Filter = ({ setFilteredZipCodes, showFilterBoard, setShowFilterBoard }) => {
  const [filterTarget, setFilterTarget] = createSignal("Residential Property");
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [selectedNeighborhoods, setSelectedNeighborhoods] = createSignal(new Set());
  const [boroughData, setBoroughData] = createSignal([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = createSignal(false);
  const [selectedAmenities, setSelectedAmenities] = createSignal(new Set());
  const [filteredAmenities, setFilteredAmenities] = createSignal({});
  const [houseTypes, setHouseTypes] = createSignal(new Set());
  const [beds, setBeds] = createSignal(0);
  const [baths, setBaths] = createSignal(0);
  const [propertySqft, setPropertySqft] = createSignal([0, 0]);
  const [propertyPrice, setPropertyPrice] = createSignal([0, 0]);
  const [filteredZipCodesLocal, setFilteredZipCodesLocal] = createSignal([]);
  const [realEstateData, setRealEstateData] = createSignal({});

  const unique_borough = ["Bronx", "Manhattan", "Queens", "Brooklyn", "Staten Island"];

  const fetchBoroughData = async () => {
    const response = await fetch("http://localhost:8000/api/borough-neighbourhood");
    const data = await response.json();
    setBoroughData(data);
  };

  const fetchRealEstateData = async (filters) => {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:8000/api/property-data?${query}`);
    const data = await response.json();
    setRealEstateData(data);
    applyFilters();
  };

  const fetchAmenities = debounce(async (neighborhoods) => {
    if (neighborhoods.length > 0) {
      const neighborhoodParams = neighborhoods.join(",");
      const response = await fetch(
        `http://localhost:8000/api/amenities?neighborhoods=${neighborhoodParams}`
      );
      const data = await response.json();
      setFilteredAmenities(data);
    } else {
      setFilteredAmenities({});
    }
  }, 300);

  const handleBoroughChange = (borough) => {
    setSelectedBoroughs((prev) => {
      const newBoroughs = new Set(prev);
      if (newBoroughs.has(borough)) {
        newBoroughs.delete(borough);
      } else {
        newBoroughs.add(borough);
      }
      setSelectedNeighborhoods(new Set());
      return newBoroughs;
    });
    handleFilterChange();
  };

  const handleNeighborhoodChange = (neighborhood) => {
    setSelectedNeighborhoods((prev) => {
      const newNeighborhoods = new Set(prev);
      if (newNeighborhoods.has(neighborhood)) {
        newNeighborhoods.delete(neighborhood);
      } else {
        newNeighborhoods.add(neighborhood);
      }
      fetchAmenities([...newNeighborhoods]);
      return newNeighborhoods;
    });
    handleFilterChange();
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
    applyFilters(realEstateData());
  };

  const handleHouseTypeChange = (type) => {
    setHouseTypes((prev) => {
      const newTypes = new Set(prev);
      if (newTypes.has(type)) {
        newTypes.delete(type);
      } else {
        newTypes.add(type);
      }
      return newTypes;
    });
    handleFilterChange();
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
            .filter(
              (el) =>
                el.borough === borough &&
                (neighborhoods.length === 0 || neighborhoods.includes(el.neighbourhood))
            )
            .flatMap((el) => el.zipcodes)
        )
      ),
    ];
  };

  const applyFilters = () => {
    let zipCodes = getZipcodes([...selectedBoroughs()], [...selectedNeighborhoods()]);

    zipCodes = zipCodes.filter((zip) => {
      const properties = realEstateData()[zip] || [];
      return properties.some((property) => {
        return (
          ([...houseTypes()].length === 0 || houseTypes().has(property.TYPE)) &&
          (beds() > 0 ? property.BEDS >= beds() : true) &&
          (baths() > 0 ? property.BATH >= baths() : true) &&
          (propertySqft()[0] > 0 ? property.PROPERTYSQFT >= propertySqft()[0] : true) &&
          (propertySqft()[1] > 0 ? property.PROPERTYSQFT <= propertySqft()[1] : true) &&
          (propertyPrice()[0] > 0 ? property.PRICE >= propertyPrice()[0] : true) &&
          (propertyPrice()[1] > 0 ? property.PRICE <= propertyPrice()[1] : true)
        );
      });
    });

    if (selectedAmenities().size > 0) {
      zipCodes = zipCodes.filter((zip) => {
        const amenities = filteredAmenities()[zip] || [];
        return [...selectedAmenities()].every((amenity) =>
          amenities.some((a) => a.FACILITY_DOMAIN_NAME === amenity)
        );
      });
    }

    setFilteredZipCodesLocal(zipCodes);
    setFilteredZipCodes(zipCodes);
  };

  const highlightZipCodesOnMap = (zipCodes) => {
    setFilteredZipCodes(zipCodes);
    setShowFilterBoard(false);
    console.log("Highlighting zip codes on map:", zipCodes);
  };

  const handleFilterChange = debounce(() => {
    const filters = {
      beds: beds() > 0 ? beds() : null,
      baths: baths() > 0 ? baths() : null,
      type: [...houseTypes()].length > 0 ? [...houseTypes()].join(",") : null,
      minprice: propertyPrice()[0] > 0 ? propertyPrice()[0] : null,
      maxprice: propertyPrice()[1] > 0 ? propertyPrice()[1] : null,
      minsqft: propertySqft()[0] > 0 ? propertySqft()[0] : null,
      maxsqft: propertySqft()[1] > 0 ? propertySqft()[1] : null,
    };

    Object.keys(filters).forEach((key) => filters[key] === null && delete filters[key]);

    fetchRealEstateData(filters);
  }, 300);

  createEffect(() => {
    handleFilterChange();
  });

  onMount(() => {
    fetchBoroughData();
    fetchRealEstateData({});
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

  const clearAllFilters = () => {
    setSelectedBoroughs(new Set());
    setSelectedNeighborhoods(new Set());
    setSelectedAmenities(new Set());
    setFilteredZipCodes([]);
    setFilteredZipCodesLocal([]);
    setShowAdvancedFilters(false);
    setFilteredAmenities({});
    setHouseTypes(new Set());
    setBeds(0);
    setBaths(0);
    setPropertySqft([0, 0]);
    setPropertyPrice([0, 0]);
  };

  return (
    <div
      class={`fixed z-10 w-[50%] flex flex-col items-center left-1/2 transform -translate-x-1/2
      gap-0.5 top-[10%] justify-center text-black transition-transform duration-500 scale-100 ${showFilterBoard() ? 'block' : 'hidden'}`}
    >
      <div
        class="grid-cols-1 divide-y m-0 px-0 
          mt-[-2vh] w-full max-h-[80vh] shadow-md z-20 
          items-center bg-white rounded-lg 
          overflow-y-auto relative"
      >
        {/* FILTER TITLE */}
        <div
          id="filter-dropdown-title"
          class="items-center justify-center relative flex h-[8%] bg-teal-500 text-white w-[100%] z-30 flex-row rounded-t-lg"
          style="position: sticky; top: 0; height: 56px;"
        >
          <button class="absolute rounded-full w-[20px] h-[20px] left-[2%] hover:bg-white text-white items-center flex hover:text-black justify-center cursor-pointer" onClick={() => setShowFilterBoard(false)}>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p>Filters for {filterTarget()}</p>
        </div>
        {/* FILTER CONTENT */}
        <div class="w-[100%] flex flex-col h-auto relative items-center py-4 px-[10%] gap-y-2.5 bg-white" id="filter-details-container">
          {/* Borough Selection */}
          <div id="borough-selection-container" class="w-full p-4 rounded-lg transition-all duration-500">
            <label htmlFor="borough-selection" class="font-sans text-2xl font-bold text-teal-500">
              Borough:
            </label>
            <div class="flex flex-wrap gap-2">
              {unique_borough.map((el) => (
                <div key={el} class="flex items-center">
                  <input name="borough-selection" value={el.toString()} type="checkbox" onChange={() => handleBoroughChange(el)} checked={selectedBoroughs().has(el)} />
                  <label htmlFor="borough-selection" class="ml-2 text-gray-700">
                    {el.toString()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Neighborhood Selection */}
          {[...selectedBoroughs()].length > 0 && (
            <div class="w-full p-4 rounded-lg transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="neighborhood-container">
              <label htmlFor="neighborhood-selection" class="font-sans text-2xl font-bold text-teal-500">
                Neighborhood:
              </label>
              <div class="w-full h-64 overflow-y-auto border border-gray-300 rounded-md">
                {getNeighborhoods([...selectedBoroughs()]).map((el) => (
                  <div key={el} class={`p-2 cursor-pointer ${selectedNeighborhoods().has(el) ? "bg-teal-500 text-white" : "bg-white text-gray-700"}`} onClick={() => handleNeighborhoodChange(el)}>
                    {el}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Button */}
          {selectedNeighborhoods().size > 0 && (
            <button class="mt-4 p-2 bg-teal-500 text-white rounded transition-all duration-500 ease-in-out transform" onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}>
              {showAdvancedFilters() ? "Hide Advanced Filters" : "Show Advanced Filters"}
            </button>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters() && (
            <div class="w-full p-4 rounded-lg mt-4 flex flex-col transition-all duration-500 ease-in-out transform opacity-100 scale-100" id="advanced-filters-container">
              <div class="flex flex-col items-center justify-center p-2 rounded-lg" id="house-type-container">
                <p class="font-sans text-2xl font-bold text-teal-500">House Type</p>
                <div class="flex flex-wrap gap-2">
                  {["Condo", "Townhouse", "Apartment", "Single Family"].map((type) => (
                    <div key={type} class="flex items-center">
                      <input type="checkbox" value={type} onChange={() => handleHouseTypeChange(type)} checked={houseTypes().has(type)} />
                      <label htmlFor={type} class="ml-2 text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div class="flex flex-col items-center justify-center p-2 rounded-lg" id="beds-container">
                <p class="font-sans text-2xl font-bold text-teal-500">Beds</p>
                <input type="number" class="border border-gray-300 rounded p-2" value={beds()} onInput={(e) => setBeds(Number(e.target.value))} onChange={handleFilterChange} />
              </div>

              <div class="flex flex-col items-center justify-center p-2 rounded-lg" id="baths-container">
                <p class="font-sans text-2xl font-bold text-teal-500">Baths</p>
                <input type="number" class="border border-gray-300 rounded p-2" value={baths()} onInput={(e) => setBaths(Number(e.target.value))} onChange={handleFilterChange} />
              </div>

              <div class="flex flex-col items-center justify-center p-2 rounded-lg" id="property-sqft-container">
                <p class="font-sans text-2xl font-bold text-teal-500">Property Sqft</p>
                <div class="flex gap-2 w-full">
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-gray-700">Minimum</p>
                    <input type="number" class="border border-gray-300 rounded p-2" value={propertySqft()[0]} onInput={(e) => setPropertySqft([Number(e.target.value), propertySqft()[1]])} onChange={handleFilterChange} />
                  </div>
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-gray-700">Maximum</p>
                    <input type="number" class="border border-gray-300 rounded p-2" value={propertySqft()[1]} onInput={(e) => setPropertySqft([propertySqft()[0], Number(e.target.value)])} onChange={handleFilterChange} />
                  </div>
                </div>
              </div>

              <div class="flex flex-col items-center justify-center p-2 rounded-lg" id="property-price-container">
                <p class="font-sans text-2xl font-bold text-teal-500">Property Price</p>
                <div class="flex gap-2 w-full">
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-gray-700">Minimum</p>
                    <input type="number" class="border border-gray-300 rounded p-2" value={propertyPrice()[0]} onInput={(e) => setPropertyPrice([Number(e.target.value), propertyPrice()[1]])} onChange={handleFilterChange} />
                  </div>
                  <div class="flex flex-col w-full rounded-lg p-2">
                    <p class="text-gray-700">Maximum</p>
                    <input type="number" class="border border-gray-300 rounded p-2" value={propertyPrice()[1]} onInput={(e) => setPropertyPrice([propertyPrice()[0], Number(e.target.value)])} onChange={handleFilterChange} />
                  </div>
                </div>
              </div>

              <div id="amenities-container" class="flex flex-col items-center justify-center p-2 rounded-lg">
                <p class="font-sans text-2xl font-bold text-teal-500">Amenities</p>
                <div class="grid grid-cols-2 w-full gap-2">
                  {uniqueAmenities().map((item) => (
                    <div key={item} class="flex items-center">
                      <input type="checkbox" class="border border-gray-300 rounded p-2" value={item} onChange={() => handleAmenityChange(item)} checked={selectedAmenities().has(item)} />
                      <label htmlFor={item} class="ml-2 text-gray-700">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Button and Filter Results */}
        <div id="button-container" class="items-center justify-center flex gap-4 bg-teal-500 text-white w-[100%] z-30 rounded-b-lg p-4 pointer-events-auto" style="position: sticky; bottom: 0; height: 56px;">
          <button class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300" onClick={() => clearAllFilters()}>
            Clear all
          </button>

          {filteredZipCodesLocal().length === 0 ? (
            <span class="text-red-500">Change filters</span>
          ) : (
            <div class="flex items-center gap-2">
              <span>Filters result in {filteredZipCodesLocal().length} zipcodes</span>
              <button class="rounded-2xl z-20 cursor-pointer w-32 h-9 flex items-center justify-center gap-1.5 hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300" onClick={() => highlightZipCodesOnMap(filteredZipCodesLocal())}>
                See on Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
