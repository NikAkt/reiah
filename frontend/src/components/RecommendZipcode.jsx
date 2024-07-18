import { createSignal, createEffect } from "solid-js";

import arrow_left from "../assets/arrow-sm-left-svgrepo-com.svg";
import arrow_right from "../assets/arrow-sm-right-svgrepo-com.svg";
import close_icon from "../assets/close-svgrepo-com.svg";

const RecommendZipcode = ({
  setRecommendedZipcode,
  setShowRecommendBoard,
  setPredictedPrice,
  setQuery,
}) => {
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

  const handleSubmitForm = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);

    const formValues = Object.fromEntries(data.entries());
    setQuery(formValues);
    const amenities = Array.from(data.getAll("amenity_preferences")).join(",");
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
      });
  };

  let slider;

  const [count, setCount] = createSignal(0);

  const handleNext = () => {
    setCount((prev) => prev + 1);
  };

  const handleBack = () => {
    setCount((prev) => prev - 1);
  };

  return (
    <form
      class="absolute z-30 h-full w-[55vw] 
     flex flex-row justify-center overflow-auto
     items-center bg-white shadow-md px-2 translate-x-[45vw] transition delay-500"
      onSubmit={handleSubmitForm}
    >
      {/* close button */}
      <div class="absolute top-[2%] left-[1%]">
        <button
          onClick={() => {
            setShowRecommendBoard((prev) => !prev);
          }}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={close_icon} class="w-[30px] h-[30px]" />
        </button>
      </div>

      {/* back button */}
      {/* <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center">
        <button
          arial-label="back"
          id="btnBack"
          disabled={count() == 0 ? true : false}
          onClick={handleBack}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={arrow_left} class="w-[20px] h-[20px]" />
        </button>
      </div> */}
      {/* <form
        class="relative bg-white h-full w-4/5 
           gap-2 flex-col border overflow-auto
          flex items-center justify-items-center"
      > */}
      <div class="absolute top-[10%] flex flex-col gap-10">
        {/* <ul
            ref={slider}
            class="relative flex w-full 
            px-0 m-0 transition-transform delay-50"
            style={{ transform: `translateX(-${count() * 100}%)` }}
          > */}
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
            <label for="borough">
              Which{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Borough
              </span>{" "}
              you are looking for?
            </label>
            <select id="borough" name="borough" required class="w-4/5">
              <For each={borough}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>

            <label for="neighborhood_preference">
              What type of{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Neighborhood
              </span>{" "}
              meets your expectation?
            </label>
            <select
              id="neighborhood_preference"
              name="neighborhood_preference"
              required
              class="max-w-[300px]"
            >
              <For each={neighbourhood_type}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>
            <label for="household_type">
              What is the ideal{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                household type
              </span>{" "}
              of the community of your property?
            </label>
            <select
              id="household_type"
              name="household_type"
              required
              class="max-w-[300px]"
            >
              <For each={household_type}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>
            <label for="business_environment">
              What kind of{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Business Environment
              </span>{" "}
              should be around your dream place?
            </label>
            <select
              id="business_environment"
              name="business_environment"
              required
              class="max-w-[300px]"
            >
              <For each={business_environment}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>
          </div>
        </div>
        <div>
          <p class="text-xl">
            Next, please let us know what type of house you want.
          </p>
          <div class="flex flex-col gap-2">
            <label for="house_type">
              Which is the{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">
                Property Type
              </span>{" "}
              you are looking for?
            </label>

            <select
              id="house_type"
              name="house_type"
              required
              class="max-w-[300px]"
            >
              <For each={property_type}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>
            <label for="sqft">
              What is the{" "}
              <span class="text-white bg-teal-500 rounded-lg px-2">size</span>{" "}
              of your house?
            </label>
            <input
              type="number"
              id="sqft"
              name="sqft"
              placeholder="1000"
              required
              class="max-w-[300px]"
            />
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
            <select id="income" name="income" required class="max-w-[300px]">
              <For each={income}>
                {(item) => <option value={item}>{item}</option>}
              </For>
            </select>
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
                  />
                </div>
              )}
            </For>
            <div class="flex gap-10 mt-[5%]">
              <button
                type="submit"
                class="rounded-lg bg-teal-500 text-white w-[20%]"
              >
                Submit
              </button>
              <button class="rounded-lg bg-teal-500 text-white w-[20%]">
                Clear all
              </button>
            </div>
          </div>
        </div>
        {/* </ul> */}
      </div>
      {/* </form> */}
      <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center">
        {/* next button */}
        {/* <button
          arial-label="next"
          id="btnNext"
          disabled={count() == 4 ? true : false}
          onClick={handleNext}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={arrow_right} class="w-[20px] h-[20px]" />
        </button> */}
      </div>
    </form>
  );
};

export default RecommendZipcode;
