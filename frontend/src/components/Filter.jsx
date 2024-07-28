import { createSignal, createEffect, onMount } from "solid-js";
import close_icon from "../assets/close-svgrepo-com.svg";

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

const Filter = ({
  setFilteredZipCodes,
  showFilterBoard,
  setShowFilterBoard,
  map,
  setSidebarOpen,
}) => {
  const [selectedBoroughs, setSelectedBoroughs] = createSignal(new Set());
  const [selectedNeighborhoods, setSelectedNeighborhoods] = createSignal(
    new Set()
  );
  const [boroughData, setBoroughData] = createSignal([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = createSignal(false);
  const [selectedAmenities, setSelectedAmenities] = createSignal(new Set());
  const [filteredAmenities, setFilteredAmenities] = createSignal({});
  const [houseType, setHouseType] = createSignal("");
  const [expandedCategories, setExpandedCategories] = createSignal(new Set());
  const [beds, setBeds] = createSignal(0);
  const [baths, setBaths] = createSignal(0);
  const [propertySqft, setPropertySqft] = createSignal([0, 0]);
  const [propertyPrice, setPropertyPrice] = createSignal([0, 0]);
  const [filteredZipCodesLocal, setFilteredZipCodesLocal] = createSignal([]);
  const [realEstateData, setRealEstateData] = createSignal([]);

  const unique_borough = [
    "Bronx",
    "Manhattan",
    "Queens",
    "Brooklyn",
    "Staten Island",
  ];
  const houseTypeOptions = [
    "Condo",
    "Townhouse",
    "Co-op",
    "Multi-family home",
    "House",
  ];

  const fetchBoroughData = async () => {
    // const response = await fetch("/api/borough-neighbourhood");
    const response = await fetch(
      "http://localhost:8000/api/borough-neighbourhood"
    );
    const data = await response.json();
    setBoroughData(data);
  };

  const fetchRealEstateData = async (filters) => {
    const query = new URLSearchParams(filters).toString();
    try {
      // const response = await fetch(`/api/property-data?${query}`);
      const response = await fetch(
        `http://localhost:8000/api/property-data?${query}`
      );
      const data = await response.json();
      setRealEstateData(data || []);
      applyFilters();
    } catch (error) {
      console.error("Error fetching real estate data:", error);
      setRealEstateData([]);
      applyFilters();
    }
  };

  const fetchAmenities = debounce(async (neighborhoods) => {
    if (neighborhoods.length > 0) {
      const neighborhoodParams = neighborhoods.join(",");
      const response = await fetch(
        // `/api/amenities?neighborhoods=${neighborhoodParams}`
        `http://localhost:8000/api/amenities?neighborhoods=${neighborhoodParams}`
      );
      const data = await response.json();
      setFilteredAmenities(
        data.reduce((acc, amenity) => {
          if (!acc[amenity.ZIPCODE]) acc[amenity.ZIPCODE] = [];
          acc[amenity.ZIPCODE].push(amenity);
          return acc;
        }, {})
      );
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
      fetchBoroughData();
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
    handleFilterChange();
  };

  const handleHouseTypeChange = (type) => {
    setHouseType(type);
    handleFilterChange();
  };

  const handleCategoryToggle = (category) => {
    setExpandedCategories((prev) => {
      const newCategories = new Set(prev);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return newCategories;
    });
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
                (neighborhoods.length === 0 ||
                  neighborhoods.includes(el.neighbourhood))
            )
            .flatMap((el) => el.zipcodes)
        )
      ),
    ];
  };

  const applyFilters = () => {
    let zipCodes = getZipcodes(
      [...selectedBoroughs()],
      [...selectedNeighborhoods()]
    );

    if (zipCodes.length === 0) {
      setFilteredZipCodesLocal([]);
      setFilteredZipCodes([]);
      return;
    }

    const hasPropertyFilters =
      houseType() !== "" ||
      beds() > 0 ||
      baths() > 0 ||
      propertySqft()[0] > 0 ||
      propertySqft()[1] > 0 ||
      propertyPrice()[0] > 0 ||
      propertyPrice()[1] > 0;

    if (hasPropertyFilters) {
      zipCodes = zipCodes.filter((zip) => {
        const properties = realEstateData().filter(
          (property) => property.ZIPCODE.toString() === zip.toString()
        );

        if (properties.length === 0) return false;

        const matches = properties.some((property) => {
          const validPrice = property.PRICE != null && !isNaN(property.PRICE);
          const validBeds = property.BEDS != null && !isNaN(property.BEDS);
          const validBaths = property.BATH != null && !isNaN(property.BATH);
          const validSqft =
            property.PROPERTYSQFT != null && !isNaN(property.PROPERTYSQFT);

          const typeMatch = houseType() === "" || houseType() === property.TYPE;
          const bedsMatch =
            beds() > 0 ? validBeds && property.BEDS >= beds() : true;
          const bathsMatch =
            baths() > 0 ? validBaths && property.BATH >= baths() : true;
          const sqftMinMatch =
            propertySqft()[0] > 0
              ? validSqft && property.PROPERTYSQFT >= propertySqft()[0]
              : true;
          const sqftMaxMatch =
            propertySqft()[1] > 0
              ? validSqft && property.PROPERTYSQFT <= propertySqft()[1]
              : true;
          const priceMinMatch =
            propertyPrice()[0] > 0
              ? validPrice && property.PRICE >= propertyPrice()[0]
              : true;
          const priceMaxMatch =
            propertyPrice()[1] > 0
              ? validPrice && property.PRICE <= propertyPrice()[1]
              : true;

          return (
            typeMatch &&
            bedsMatch &&
            bathsMatch &&
            sqftMinMatch &&
            sqftMaxMatch &&
            priceMinMatch &&
            priceMaxMatch
          );
        });

        return matches;
      });
    }

    const hasAmenityFilters = selectedAmenities().size > 0;

    if (hasAmenityFilters) {
      zipCodes = zipCodes.filter((zip) => {
        const amenities = Array.isArray(filteredAmenities()[zip])
          ? filteredAmenities()[zip]
          : [];
        const matches = [...selectedAmenities()].every((amenity) =>
          amenities.some((a) => a.FACILITY_DOMAIN_NAME === amenity)
        );
        return matches;
      });
    }

    setFilteredZipCodesLocal(zipCodes);
    setFilteredZipCodes(zipCodes);
  };

  const handleFilterChange = debounce(() => {
    const filters = {
      beds: beds() > 0 ? beds() : null,
      baths: baths() > 0 ? baths() : null,
      type: houseType() ? houseType() : null,
      minprice: propertyPrice()[0] > 0 ? propertyPrice()[0] : null,
      maxprice: propertyPrice()[1] > 0 ? propertyPrice()[1] : null,
      minsqft: propertySqft()[0] > 0 ? propertySqft()[0] : null,
      maxsqft: propertySqft()[1] > 0 ? propertySqft()[1] : null,
    };

    Object.keys(filters).forEach(
      (key) => filters[key] === null && delete filters[key]
    );

    fetchRealEstateData(filters);
  }, 300);

  createEffect(() => {
    handleFilterChange();
  });

  onMount(() => {
    fetchBoroughData();
    fetchRealEstateData({});
  });

  const categorizedAmenities = () => {
    const categories = {};
    filteredZipCodesLocal().forEach((zipCode) => {
      const amenities = Array.isArray(filteredAmenities()[zipCode])
        ? filteredAmenities()[zipCode]
        : [];
      amenities.forEach((amenity) => {
        if (!categories[amenity.FACILITY_T]) {
          categories[amenity.FACILITY_T] = new Set();
        }
        categories[amenity.FACILITY_T].add(amenity.FACILITY_DOMAIN_NAME);
      });
    });
    const result = {};
    for (const [key, value] of Object.entries(categories)) {
      result[key] = Array.from(value);
    }
    return result;
  };

  const clearAllFilters = () => {
    setSelectedBoroughs(new Set());
    setSelectedNeighborhoods(new Set());
    setSelectedAmenities(new Set());
    setFilteredZipCodes([]);
    setFilteredZipCodesLocal([]);
    setShowAdvancedFilters(false);
    setFilteredAmenities({});
    setHouseType("");
    setBeds(0);
    setBaths(0);
    setPropertySqft([0, 0]);
    setPropertyPrice([0, 0]);
  };

  const highlightZipCodesOnMap = (zipCodes) => {
    setFilteredZipCodes(zipCodes);
    setShowFilterBoard(false);
    setSidebarOpen(false);
  };

  return (
    <div
      class={`absolute z-40 sm:h-full bg-white dark:bg-black dark:text-white h-2/5 dark:text-white w-full bottom-0
         flex flex-col sm:left-[50vw] sm:w-[50vw] border-black overflow-y-auto
      gap-0.5 justify-between text-black transition-transform duration-500 scale-100 ${
        showFilterBoard() ? "sm:translate-y-0" : "sm:-translate-y-full hidden"
      }`}
    >
      <div class="relative flex-1 w-full bg-white dark:bg-black dark:text-white rounded-lg overflow-y-auto">
        {/* FILTER TITLE */}
        <div
          id="filter-dropdown-title"
          class="flex items-center justify-center bg-white dark:bg-black dark:text-white text-black py-4"
          style="position: sticky; top: 0;"
        >
          <button
            class="absolute left-4 rounded-full w-8 h-8 flex items-center justify-center text-black hover:bg-teal-500 dark:bg-white"
            onClick={() => {
              setShowFilterBoard(false);
              setSidebarOpen(false);
            }}
          >
            <img src={close_icon} class="w-8 h-8" />
          </button>
          <p class="text-xl">Filters</p>
        </div>

        {/* FILTER CONTENT */}
        <div class="w-full p-6 bg-white dark:bg-black dark:text-white">
          {/* Borough Selection */}
          <div class="w-full p-4 rounded-lg bg-white dark:bg-black dark:text-white">
            <label
              htmlFor="borough-selection"
              class="block mb-2 text-lg font-semibold"
            >
              Borough:
            </label>
            <div class="flex flex-wrap gap-2 dark:bg-black dark:text-white">
              {unique_borough.map((el) => (
                <button
                  key={el}
                  class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300 hover:text-white ${
                    selectedBoroughs().has(el) ? "bg-teal-500 text-white" : ""
                  }`}
                  onClick={() => handleBoroughChange(el)}
                >
                  {el}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood Selection */}
          {[...selectedBoroughs()].length > 0 && (
            <div class="w-full p-4 rounded-lg bg-white dark:bg-black dark:text-white">
              <label
                htmlFor="neighborhood-selection"
                class="block mb-2 text-lg font-semibold"
              >
                Neighborhood:
              </label>
              <div class="w-full h-64 overflow-y-auto border border-gray-300 rounded-md">
                {getNeighborhoods([...selectedBoroughs()]).map((el) => (
                  <div
                    key={el}
                    class={`p-2 cursor-pointer ${
                      selectedNeighborhoods().has(el)
                        ? "bg-teal-500 text-white "
                        : "bg-white dark:bg-black dark:text-white text-gray-700"
                    }`}
                    onClick={() => handleNeighborhoodChange(el)}
                  >
                    {el}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Button */}
          {selectedNeighborhoods().size > 0 && (
            <button
              class="mt-4 p-3 bg-teal-500 text-white rounded text-lg"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters())}
            >
              {showAdvancedFilters()
                ? "Hide Advanced Filters"
                : "Show Advanced Filters"}
            </button>
          )}

          {/* Advanced Filters */}
          {showAdvancedFilters() && (
            <div class="w-full p-4 rounded-lg mt-4 flex flex-col gap-4 bg-white dark:bg-black dark:text-white">
              {/* House Type */}
              <div class="flex flex-col gap-2 bg-white dark:bg-black dark:text-white">
                <label htmlFor="houseType" class="text-lg font-semibold">
                  House Type
                </label>
                <div class="flex flex-wrap gap-2 bg-white dark:bg-black dark:text-white">
                  {houseTypeOptions.map((type) => (
                    <button
                      key={type}
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300 hover:text-white ${
                        houseType() === type ? "bg-teal-500 text-white" : ""
                      }`}
                      onClick={() => handleHouseTypeChange(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beds and Baths */}
              <div class="flex gap-4 w-full bg-white dark:bg-black dark:text-white">
                <div class="flex flex-col gap-2 bg-white dark:bg-black dark:text-white">
                  <label htmlFor="beds" class="text-lg font-semibold">
                    Beds
                  </label>
                  <input
                    type="number"
                    id="beds"
                    class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                    value={beds()}
                    onInput={(e) => setBeds(Number(e.target.value))}
                    onChange={handleFilterChange}
                    style="width: 100px;"
                  />
                </div>
                <div class="flex flex-col gap-2 bg-white dark:bg-black dark:text-white">
                  <label htmlFor="baths" class="text-lg font-semibold">
                    Baths
                  </label>
                  <input
                    type="number"
                    id="baths"
                    class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                    value={baths()}
                    onInput={(e) => setBaths(Number(e.target.value))}
                    onChange={handleFilterChange}
                    style="width: 100px;"
                  />
                </div>
              </div>

              {/* Property Sqft */}
              <div class="flex flex-col gap-2 bg-white dark:bg-black dark:text-white">
                <label htmlFor="propertySqft" class="text-lg font-semibold">
                  Property Sqft
                </label>
                <div class="flex gap-2 bg-white dark:bg-black dark:text-white">
                  <div class="flex flex-col w-full bg-white dark:bg-black dark:text-white">
                    <label htmlFor="minSqft" class="text-gray-700">
                      Minimum
                    </label>
                    <input
                      type="number"
                      id="minSqft"
                      class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                      value={propertySqft()[0]}
                      onInput={(e) =>
                        setPropertySqft([
                          Number(e.target.value),
                          propertySqft()[1],
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div class="flex flex-col w-full bg-white dark:bg-black dark:text-white">
                    <label htmlFor="maxSqft" class="text-gray-700">
                      Maximum
                    </label>
                    <input
                      type="number"
                      id="maxSqft"
                      class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                      value={propertySqft()[1]}
                      onInput={(e) =>
                        setPropertySqft([
                          propertySqft()[0],
                          Number(e.target.value),
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              {/* Property Price */}
              <div class="flex flex-col gap-2 bg-white dark:bg-black dark:text-white">
                <label htmlFor="propertyPrice" class="text-lg font-semibold">
                  Property Price
                </label>
                <div class="flex gap-2 bg-white dark:bg-black dark:text-white">
                  <div class="flex flex-col w-full bg-white dark:bg-black dark:text-white">
                    <label htmlFor="minPrice" class="text-gray-700">
                      Minimum
                    </label>
                    <input
                      type="number"
                      id="minPrice"
                      class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                      value={propertyPrice()[0]}
                      onInput={(e) =>
                        setPropertyPrice([
                          Number(e.target.value),
                          propertyPrice()[1],
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div class="flex flex-col w-full bg-white dark:bg-black dark:text-white">
                    <label htmlFor="maxPrice" class="text-gray-700">
                      Maximum
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      class="border border-gray-300 rounded p-2 text-lg dark:text-black"
                      value={propertyPrice()[1]}
                      onInput={(e) =>
                        setPropertyPrice([
                          propertyPrice()[0],
                          Number(e.target.value),
                        ])
                      }
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div class="flex flex-col gap-2 dark:bg-black dark:text-white">
                <label htmlFor="amenities" class="text-lg font-semibold">
                  Amenities
                </label>
                {Object.entries(categorizedAmenities()).map(
                  ([category, amenities]) => (
                    <div key={category} class="flex flex-col gap-2">
                      <button
                        class="font-semibold text-gray-700 text-left"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        {category}{" "}
                        {expandedCategories().has(category) ? "-" : "+"}
                      </button>
                      {expandedCategories().has(category) && (
                        <div class="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-md">
                          {amenities.map((amenity) => (
                            <div key={amenity} class="flex items-center">
                              <input
                                type="checkbox"
                                id={amenity}
                                class="border border-gray-300 rounded p-2 dark:text-black"
                                onChange={() => handleAmenityChange(amenity)}
                                checked={selectedAmenities().has(amenity)}
                              />
                              <label
                                htmlFor={amenity}
                                class="ml-2 text-gray-700"
                              >
                                {amenity}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Button and Filter Results */}
      <div class="flex items-center justify-between text-black p-4 w-full bg-white dark:bg-black dark:text-white">
        <button
          class="rounded-2xl cursor-pointer px-4 py-2 bg-teal-500 text-white hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
          onClick={() => clearAllFilters()}
        >
          Clear all
        </button>

        {filteredZipCodesLocal().length === 0 ? (
          <span class="text-red-500">Change filters</span>
        ) : (
          <div class="flex items-center gap-2">
            <span>
              Filters result in {filteredZipCodesLocal().length} zipcodes
            </span>
            <button
              class="rounded-2xl cursor-pointer px-4 py-2 bg-teal-500 text-white hover:scale-110 duration-300 active:bg-teal-700 focus:outline-none focus:ring focus:ring-teal-300"
              onClick={() => {
                highlightZipCodesOnMap(filteredZipCodesLocal());
                map().setZoom(11);
              }}
            >
              See on Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
