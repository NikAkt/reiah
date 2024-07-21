import { createSignal, createEffect } from "solid-js";

// import arrow_left from "../assets/arrow-sm-left-svgrepo-com.svg";
// import arrow_right from "../assets/arrow-sm-right-svgrepo-com.svg";
import close_icon from "../assets/close-svgrepo-com.svg";

const RecommendZipcode = ({
  setRecommendedZipcode,
  setShowRecommendBoard,
  setPredictedPrice,
  setQuery,
  showRecommendBoard,
  setSidebarOpen,
}) => {
  //form inputs
  const [getSelectedBorough, setSelectedBorough] = createSignal(null);
  const [getSelectedNeighbourhood, setSelectedNeighbourhood] =
    createSignal(null);
  const [getSelectedIncome, setSelectedIncome] = createSignal(null);
  const [getSelectedBusiness, setSelectedBusiness] =
    createSignal("Mostly residential");
  const [getSelectedProperty, setSelectedProperty] = createSignal(null);
  const [getSelectedAmenities, setSelectedAmenities] = createSignal([]);
  const [getSelectedHousehold, setSelectedHousehold] = createSignal(
    "Mix of families and singles"
  );
  const [getSelectedBeds, setSelectedBeds] = createSignal(1);
  const [getSelectedBaths, setSelectedBaths] = createSignal(1);
  const [getSelectedMaxPrice, setSelectedMaxPrice] = createSignal(1000000);
  const [getSelectedSize, setSelectedSize] = createSignal(1000);

  //model inputs
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

  const handleSubmitForm = () => {
    //http://localhost:5001/get_recommendations?
    //borough=Brooklyn
    //&max_price=1000000
    //&house_type=House
    //&bedrooms=2&bathrooms=1&sqft=1000
    //&income=Prefer%20not%20to%20say
    //&neighborhood_preference=Balanced%20mix
    //&household_type=Mix%20of%20families%20and%20singles
    //&business_environment=Mix%20of%20residential%20and%20commercial
    //&amenity_preferences=Parks%20and%20recreation,Public%20transportation
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
      });
  };

  return (
    <div
      class={`absolute z-40 h-full bg-white 
        text-center flex w-[55vw] left-[45vw]
      items-center overflow-y-auto
   gap-0.5 justify-center text-black 
   transform  transition-transform duration-500 scale-100 ${
     showRecommendBoard() ? "translate-y-0" : "-translate-y-full"
   }`}
    >
      {/* close button */}
      <div class="absolute top-[2%] left-[1%]">
        <button
          onClick={() => {
            setShowRecommendBoard(false);
            setSidebarOpen(false);
          }}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={close_icon} class="w-[30px] h-[30px]" />
        </button>
      </div>

      <div
        class={`m-auto top-[10%] grid grid-row-1 divide-y gap-10 place-items-center    
        `}
      >
        <div>
          <p class="text-2xl">Welcome to Reiah.</p>
          <p class="text-xl">
            Let's start our journey to find your best investment zipcodes!
          </p>
        </div>
        <div class="flex flex-col">
          <p class="text-xl">
            First, please tell us what environment you are looking for?
          </p>
          <div class="flex flex-col gap-2">
            {/* Borough */}
            <label for="borough">
              Which{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Borough
              </span>{" "}
              you are looking for?
            </label>
            {/* <select id="borough" name="borough" required class="w-4/5">
              <For each={borough}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select> */}
            <div class="flex gap-2">
              <For each={borough}>
                {(item) => (
                  <button
                    id={`select-borough-${item}`}
                    class={`hover:bg-teal-500 px-2 rounded-lg border-solid
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

            {/* Household Type */}
            <label for="neighborhood_preference">
              What type of{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Neighborhood
              </span>{" "}
              meets your expectation?
            </label>

            <For each={neighbourhood_type}>
              {(item) => (
                <button
                  class={`
                    w-[80%]
                    hover:bg-teal-500 hover:text-white ${
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
            {/* Household type */}
            <label for="household_type">
              What is the ideal{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                household type
              </span>{" "}
              of the community of your property?
            </label>

            <For each={household_type}>
              {(item) => (
                <button
                  class={`
              w-[80%]
              hover:bg-teal-500 hover:text-white ${
                getSelectedHousehold() === item ? "bg-teal-500 text-white" : ""
              }`}
                  onClick={() => {
                    setSelectedHousehold(item);
                  }}
                >
                  {item}
                </button>
              )}
            </For>

            {/* Business Environment */}
            <label for="business_environment">
              What kind of{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Business Environment
              </span>{" "}
              should be around your dream place?
            </label>

            <For each={business_environment}>
              {(item) => (
                <button
                  class={`
                w-[80%]
                hover:bg-teal-500 hover:text-white ${
                  getSelectedBusiness() === item ? "bg-teal-500 text-white" : ""
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

        {/* Second Part */}
        <div>
          <p class="text-xl">
            Next, please let us know what type of house you want.
          </p>
          <div class="flex flex-col gap-2">
            {/* House Type */}
            <label for="house_type">
              Which is the{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Property Type
              </span>{" "}
              you are looking for?
            </label>

            <For each={property_type}>
              {(item) => (
                <button
                  class={`
              w-[80%]
              hover:bg-teal-500 hover:text-white ${
                getSelectedProperty() === item ? "bg-teal-500 text-white" : ""
              }`}
                  onClick={() => {
                    setSelectedProperty(item);
                  }}
                >
                  {item}
                </button>
              )}
            </For>

            {/* Size */}
            <label for="sqft">
              What is the{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">size</span>{" "}
              of your house?
            </label>
            <div class="flex">
              <input
                type="number"
                id="sqft"
                name="sqft"
                min="0"
                step="1"
                value={getSelectedSize().toString()}
                required
                class="w-full"
                onChange={(event) => {
                  setSelectedSize(event.target.value);
                }}
              />
            </div>

            {/* Beds */}
            <label for="beds">
              How many{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                bedrooms
              </span>{" "}
              your house has?
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              placeholder="1"
              class="max-w-[300px]"
              onChange={(event) => {
                setSelectedBeds(event.target.value);
              }}
            />
            <label for="baths">
              How many{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                bathrooms
              </span>{" "}
              your house has?
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              placeholder="1"
              class="max-w-[300px]"
              onChange={(event) => {
                setSelectedBaths(event.target.value);
              }}
            />

            <label for="max_price">
              What should be the{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Maximum Price
              </span>{" "}
              for the properties you are looking for?
            </label>
            <input
              type="number"
              id="max_price"
              name="max_price"
              placeholder="1000000"
              class="max-w-[300px]"
              onChange={(event) => {
                setSelectedMaxPrice(event.target.value);
              }}
            />
          </div>
        </div>
        <div>
          <p class="text-xl">
            We are almost there. Please give us some personal information.
          </p>
          <div class="flex flex-col gap-2">
            <label for="income">
              What is the range of your{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                yearly income
              </span>{" "}
              ?
            </label>

            <For each={income}>
              {(item) => (
                <button
                  class={`
                  w-[80%]
                  hover:bg-teal-500 hover:text-white ${
                    getSelectedIncome() === item ? "bg-teal-500 text-white" : ""
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
        <div>
          <p class="text-xl">
            Last but not least, please provide us some other information.
          </p>
          <div class="flex flex-col">
            <label for="amenity_preferences">
              Do you have preferences for{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                amenities
              </span>{" "}
              ?
            </label>

            <For each={amenity}>
              {(item) => (
                <div class="flex gap-2">
                  <label for="public_transportation">{item}</label>
                  <input
                    type="checkbox"
                    id={item}
                    name="amenity_preferences"
                    value={item}
                    onChange={() => {
                      setSelectedAmenities((prev) => [...prev, item]);
                    }}
                  />
                </div>
              )}
            </For>
            <div class="flex gap-10 mt-[5%]">
              <button
                type="submit"
                class="rounded-lg bg-teal-500 text-white w-[20%]"
                onClick={handleSubmitForm}
              >
                Submit
              </button>
              <input
                type="reset"
                class="rounded-lg bg-teal-500 text-white w-[20%] cursor-pointer"
              ></input>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center"></div>
    </div>
  );
};

export default RecommendZipcode;
