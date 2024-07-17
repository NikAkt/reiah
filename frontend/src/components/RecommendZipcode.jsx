import { createSignal, createEffect, onMount } from "solid-js";

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
    "No preference",
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
  ];

  const property_type = [
    "Condo",
    "House",
    "Co-op",
    "Townhouse",
    "Multi-family home",
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
    <div
      class="absolute z-30 top-[10vh] ml-[30%] h-[60vh] max-w-[40vw]
     flex flex-row justify-center items-center bg-white shadow-md px-2"
    >
      <div class="absolute top-[2%] left-[1%]">
        <button
          onClick={() => {
            setShowRecommendBoard((prev) => !prev);
          }}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={close_icon} class="w-[20px] h-[20px]" />
        </button>
      </div>
      <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center">
        <button
          arial-label="back"
          id="btnBack"
          disabled={count() == 0 ? true : false}
          onClick={handleBack}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={arrow_left} class="w-[20px] h-[20px]" />
        </button>
      </div>
      <form
        onSubmit={handleSubmitForm}
        class="bg-white h-full w-[97%]
          flex items-center justify-items-center overflow-hidden"
      >
        <div>
          <ul
            ref={slider}
            class="flex w-full px-0 m-0 transition-transform delay-50"
            style={{ transform: `translateX(-${count() * 100}%)` }}
          >
            <li
              class="min-w-full
              p-[10px]
            "
            >
              <div>Get Started!</div>
            </li>
            <li class="min-w-full">
              <div class="flex flex-col">
                <label for="borough">Borough Preference:</label>
                <select
                  id="borough"
                  name="borough"
                  required
                  class="max-w-[300px]"
                >
                  <For each={borough}>
                    {(item) => <option value={item}>{item}</option>}
                  </For>
                </select>

                <label for="neighborhood_preference">
                  Neighborhood Preference:
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
                <label for="business_environment">Business Environment:</label>
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
            </li>
            <li class="min-w-full p-[20px] transition delay-50">
              <div class="flex flex-col">
                <label for="sqft">Square Footage:</label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  placeholder="1000"
                  required
                  class="max-w-[300px]"
                />
                <label for="sqft">Beds:</label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  placeholder="1"
                  class="max-w-[300px]"
                />
                <label for="sqft">Bath:</label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  placeholder="1"
                  class="max-w-[300px]"
                />

                <label for="max_price">Max Price:</label>
                <input
                  type="number"
                  id="max_price"
                  name="max_price"
                  placeholder="1000000"
                  class="max-w-[300px]"
                />

                <label for="neighborhood_preference">Property Type:</label>

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
              </div>
            </li>
            <li class="min-w-full p-[20px] transition delay-50">
              <div class="flex flex-col w-[80%] ">
                <label for="income">Income:</label>
                <select
                  id="income"
                  name="income"
                  required
                  class="max-w-[300px]"
                >
                  <For each={income}>
                    {(item) => <option value={item}>{item}</option>}
                  </For>
                </select>
                <label for="household_type">Household Type:</label>
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
              </div>
            </li>
            <li class="min-w-full p-[20px] transition delay-50">
              <div class="flex flex-col">
                <label for="amenity_preferences">Amenity Preferences:</label>

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
                <button
                  type="submit"
                  class="rounded-lg bg-black text-white w-[20%]"
                >
                  Submit
                </button>
              </div>
            </li>
          </ul>
        </div>
      </form>
      <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center">
        <button
          arial-label="next"
          id="btnNext"
          disabled={count() == 4 ? true : false}
          onClick={handleNext}
          class="hover:bg-teal-500 bg-white rounded-full items-center justify-center flex"
        >
          <img src={arrow_right} class="w-[20px] h-[20px]" />
        </button>
      </div>
    </div>
  );
};

export default RecommendZipcode;
