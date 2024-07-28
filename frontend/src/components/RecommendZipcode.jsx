import { createSignal } from "solid-js";
import close_icon from "../assets/close-svgrepo-com.svg";

const borough = ["Bronx", "Manhattan", "Brooklyn", "Queens", "Staten Island"];
const neighbourhood_type = [
  "Quiet residential",
  "Balanced mix",
  "Lively urban",
  "No preference",
];
const income = [
  "Under $50,000",
  "$50,000-$100,000",
  "$100,000-$150,000",
  "$150,000-$200,000",
  "Over $200,000",
  "Prefer not to say",
];
const business_environment = [
  "Mostly residential",
  "Mix of residential and commercial",
  "Bustling commercial area",
  "No preference",
];
const amenity = [
  "Parks and recreation",
  "Health Services",
  "Schools and education",
  "Public transportation",
  "Religious institutions",
  "No preference",
];
const household_type = [
  "Mix of families and singles",
  "Mostly families",
  "Mostly singles",
  "No preference",
];
const property_type = [
  "Condo",
  "House",
  "Co-op",
  "Townhouse",
  "Multi-family home",
  "No preference",
];

const RecommendZipcode = ({
  setRecommendedZipcode,
  setShowRecommendBoard,
  setPredictedPrice,
  setQuery,
  showRecommendBoard,
  setSidebarOpen,
}) => {
  const [getSelectedBorough, setSelectedBorough] = createSignal(borough[0]);
  const [getSelectedNeighbourhood, setSelectedNeighbourhood] = createSignal(
    neighbourhood_type[0]
  );
  const [getSelectedIncome, setSelectedIncome] = createSignal(income[0]);
  const [getSelectedBusiness, setSelectedBusiness] = createSignal(
    business_environment[0]
  );
  const [getSelectedProperty, setSelectedProperty] = createSignal(
    property_type[0]
  );
  const [getSelectedAmenities, setSelectedAmenities] = createSignal([]);
  const [getSelectedHousehold, setSelectedHousehold] = createSignal(
    household_type[0]
  );
  const [getSelectedBeds, setSelectedBeds] = createSignal(1);
  const [getSelectedBaths, setSelectedBaths] = createSignal(1);
  const [getSelectedMaxPrice, setSelectedMaxPrice] = createSignal(1000000);
  const [getSelectedSize, setSelectedSize] = createSignal(1000);
  const [noZipcodesMessage, setNoZipcodesMessage] = createSignal("");

  const resetForm = () => {
    setSelectedBorough(borough[0]);
    setSelectedNeighbourhood(neighbourhood_type[0]);
    setSelectedIncome(income[0]);
    setSelectedBusiness(business_environment[0]);
    setSelectedProperty(property_type[0]);
    setSelectedAmenities([]);
    setSelectedHousehold(household_type[0]);
    setSelectedBeds(1);
    setSelectedBaths(1);
    setSelectedMaxPrice(1000000);
    setSelectedSize(1000);
    setRecommendedZipcode([]); // Reset the highlight on the map
    setNoZipcodesMessage("");

    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach((el) => (el.checked = false)); // Clear all checkboxes
  };

  const handleSubmitForm = () => {
    if (
      !getSelectedBorough() ||
      !getSelectedNeighbourhood() ||
      !getSelectedIncome() ||
      !getSelectedBusiness() ||
      !getSelectedProperty() ||
      getSelectedAmenities().length === 0 ||
      !getSelectedHousehold() ||
      !getSelectedBeds() ||
      !getSelectedBaths() ||
      !getSelectedMaxPrice() ||
      !getSelectedSize()
    ) {
      alert("Please fill in all the required fields.");
      return;
    }

    const formValues = {
      borough: getSelectedBorough(),
      max_price: getSelectedMaxPrice(),
      house_type: getSelectedProperty(),
      bedrooms: getSelectedBeds(),
      bathrooms: getSelectedBaths(),
      sqft: getSelectedSize(),
      income: getSelectedIncome(),
      neighborhood_preference: getSelectedNeighbourhood(),
      household_type: getSelectedHousehold(),
      business_environment: getSelectedBusiness(),
      amenity_preferences: getSelectedAmenities(),
    };
    setQuery(formValues);
    const amenities = Array.from(formValues["amenity_preferences"]).join(",");
    formValues.amenity_preferences = amenities;
    let query = "http://localhost:5001/get_recommendations?";
    for (let [key, value] of Object.entries(formValues)) {
      query += `${key}=${value}&`;
    }

    fetch(query)
      .then((response) => response.json())
      .then((data) => {
        console.log("prediction recommendation", data);
        if (data.length === 0) {
          setNoZipcodesMessage("Unfortunately, no zip codes fit the criteria.");
          setRecommendedZipcode([]);
          setPredictedPrice({});
        } else {
          console.log(data);
          let recommendedZipcode = [];
          let predictedPrice = {};
          data.forEach((el) => {
            recommendedZipcode.push(el.zipcode);
            predictedPrice[el.zipcode] = el["predicted_price"];
          });
          setRecommendedZipcode(recommendedZipcode);
          setPredictedPrice(predictedPrice);
          setShowRecommendBoard(false);
          setSidebarOpen(false);
          setNoZipcodesMessage("");
        }
      });
  };

  return (
    <div
      //     class={`absolute z-40 h-full bg-white w-full bottom-0 h-2/5
      //       text-center flex sm:w-[55vw] sm:left-[45vw]
      //     items-center overflow-y-auto
      //  gap-0.5 justify-center text-black
      //  transform  transition-transform duration-500 scale-100 ${
      //    showRecommendBoard() ? "sm:translate-y-0 " : "sm:-translate-y-full hidden"
      //  }`}
      class={`absolute z-40 sm:h-full bg-white h-2/5 dark:text-white dark:bg-black w-full bottom-0
    flex flex-col sm:left-[45vw] sm:w-[55vw] border-black overflow-y-auto
 gap-0.5 justify-between text-black transition-transform duration-500 scale-100 ${
   showRecommendBoard()
     ? "sm:translate-y-0"
     : "sm:-translate-y-full hidden dark:text-black"
 }`}
    >
      <div class="absolute top-4 left-4">
        <button
          onClick={() => {
            setShowRecommendBoard(false);
            setSidebarOpen(false);
          }}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={close_icon} class="w-8 h-8" />
        </button>
      </div>

      <div class="m-auto top-[10%] grid grid-row-1 divide-y gap-10 place-items-center w-full p-6">
        <div class="mb-8 text-center">
          <p class="text-2xl mb-4">Welcome to Reiah.</p>
          <p class="text-xl mb-8">
            Let's start our journey to find your best investment zipcodes!
          </p>
        </div>

        <div class="flex flex-col gap-8 mb-8">
          <div class="flex flex-col gap-4">
            <p class="text-xl">Environment Preferences</p>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="borough">
                Which borough are you looking for?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={borough}>
                  {(item) => (
                    <button
                      id={`select-borough-${item}`}
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedBorough() !== item
                            ? ""
                            : "bg-teal-500 text-white"
                        }`}
                      onClick={() => {
                        setSelectedBorough(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="text-left">
              <label
                class="block mb-2 text-lg font-semibold"
                for="neighborhood_preference"
              >
                Preferred neighborhood type?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={neighbourhood_type}>
                  {(item) => (
                    <button
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedNeighbourhood() === item
                            ? "bg-teal-500 text-white"
                            : ""
                        }`}
                      onClick={() => {
                        setSelectedNeighbourhood(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="text-left">
              <label
                class="block mb-2 text-lg font-semibold"
                for="household_type"
              >
                Preferred household type?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={household_type}>
                  {(item) => (
                    <button
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedHousehold() === item
                            ? "bg-teal-500 text-white"
                            : ""
                        }`}
                      onClick={() => {
                        setSelectedHousehold(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="text-left">
              <label
                class="block mb-2 text-lg font-semibold"
                for="business_environment"
              >
                Preferred business environment?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={business_environment}>
                  {(item) => (
                    <button
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedBusiness() === item
                            ? "bg-teal-500 text-white"
                            : ""
                        }`}
                      onClick={() => {
                        setSelectedBusiness(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-8 mb-8">
          <div class="flex flex-col gap-4">
            <p class="text-xl">House Preferences</p>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="house_type">
                Which property type are you looking for?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={property_type}>
                  {(item) => (
                    <button
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedProperty() === item
                            ? "bg-teal-500 text-white"
                            : ""
                        }`}
                      onClick={() => {
                        setSelectedProperty(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="sqft">
                House size (sqft)?
              </label>
              <input
                type="number"
                id="sqft"
                name="sqft"
                min="0"
                step="1"
                value={getSelectedSize()}
                required
                class="w-32 p-2 border border-gray-300 rounded dark:text-black"
                onInput={(event) => {
                  setSelectedSize(event.target.value);
                }}
              />
            </div>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="bedrooms">
                Number of bedrooms?
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                placeholder="1"
                value={getSelectedBeds()}
                class="w-32 p-2 border border-gray-300 rounded dark:text-black"
                onInput={(event) => {
                  setSelectedBeds(event.target.value);
                }}
              />
            </div>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="bathrooms">
                Number of bathrooms?
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                placeholder="1"
                value={getSelectedBaths()}
                class="w-32 p-2 border border-gray-300 rounded dark:text-black"
                onInput={(event) => {
                  setSelectedBaths(event.target.value);
                }}
              />
            </div>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="max_price">
                Maximum price?
              </label>
              <input
                type="number"
                id="max_price"
                name="max_price"
                placeholder="1000000"
                value={getSelectedMaxPrice()}
                class="w-48 p-2 border border-gray-300 rounded dark:text-black"
                onInput={(event) => {
                  setSelectedMaxPrice(event.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-8 mb-8">
          <div class="flex flex-col gap-4">
            <p class="text-xl">Personal Information</p>

            <div class="text-left">
              <label class="block mb-2 text-lg font-semibold" for="income">
                Yearly income range?
              </label>
              <div class="flex gap-2 flex-wrap">
                <For each={income}>
                  {(item) => (
                    <button
                      class={`hover:bg-teal-500 px-4 py-2 rounded-lg border border-gray-300
                        hover:text-white ${
                          getSelectedIncome() === item
                            ? "bg-teal-500 text-white"
                            : ""
                        }`}
                      onClick={() => {
                        setSelectedIncome(item);
                      }}
                    >
                      {item}
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-4">
            <p class="text-xl">Additional Information</p>

            <div class="text-left">
              <label
                class="block mb-2 text-lg font-semibold"
                for="amenity_preferences"
              >
                Preferred amenities?
              </label>
              <div class="flex flex-wrap gap-4">
                <For each={amenity}>
                  {(item) => (
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={item}
                        name="amenity_preferences"
                        value={item}
                        class="w-4 h-4 border border-gray-300 dark:text-black"
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          setSelectedAmenities((prev) =>
                            isChecked
                              ? [...prev, item]
                              : prev.filter((amenity) => amenity !== item)
                          );
                        }}
                      />
                      <label for={item} class="text-lg">
                        {item}
                      </label>
                    </div>
                  )}
                </For>
              </div>
            </div>

            <div class="flex flex-col items-center gap-4 mt-8">
              {noZipcodesMessage() && (
                <div class="text-red-500 text-lg font-semibold">
                  {noZipcodesMessage()}
                </div>
              )}
              <div class="flex gap-4">
                <button
                  type="submit"
                  class="rounded-lg bg-teal-500 text-white w-32 py-2"
                  onClick={handleSubmitForm}
                >
                  Submit
                </button>
                <button
                  type="button"
                  class="rounded-lg bg-teal-500 text-white w-32 py-2 cursor-pointer"
                  onClick={resetForm}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendZipcode;
