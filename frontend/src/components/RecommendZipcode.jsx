import { createSignal, createEffect, onMount } from "solid-js";
import ArrowBackIcon from "@suid/icons-material/ArrowBack";
import ArrowForwardIcon from "@suid/icons-material/ArrowForward";
import { IconButton } from "@suid/material";

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

const RecommendZipcode = ({ setRecommendedZipcode }) => {
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
  ];

  const business_environment = [
    "Mostly residential",
    "Mix of residential and commercial",
    "Mostly commercial",
    "No preference",
  ];

  const amenity = [
    "Parks and recreation",
    "Shopping and restaurants",
    "Schools and education",
    "Public transportation",
    "Cultural attractions",
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

  const [formData, setFromData] = createSignal({});

  const handleSubmitForm = (event) => {
    event.preventDefault();
    setRecommendedZipcode(10001);
    console.log(event.target);
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
      class="absolute z-30 top-[10vh] left-[20vw] h-[50vh] w-[60vw]
     flex flex-row justify-center items-center bg-white shadow-md"
    >
      <div class="rounded-full w-[30px] h-[30px] bg-green flex items-center justify-center">
        <IconButton
          arial-label="back"
          id="btnBack"
          disabled={count() == 0 ? true : false}
          onClick={handleBack}
        >
          <ArrowBackIcon />
        </IconButton>
      </div>
      <form
        onSubmit={handleSubmitForm}
        class="bg-white h-full w-[97%]
          flex items-center justify-items-center overflow-hidden"
      >
        <div>
          <ul
            ref={slider}
            class={`flex translate-x-[-${count() * 100}%]
            transition delay-50 w-full px-0 m-0`}
          >
            <li class="min-w-[100%] p-[20px] transition delay-50">
              <div>Get Started!</div>
            </li>
            <li class="min-w-full p-[20px] transition delay-50">
              <div class="flex flex-col">
                <label for="neighborhood_preference">Borough Preference:</label>
                <select
                  id="neighborhood_preference"
                  name="neighborhood_preference"
                  required
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
                <input type="number" id="sqft" name="sqft" required />
                <label for="sqft">Beds:</label>
                <input type="number" id="beds" name="beds" placeholder="1" />
                <label for="sqft">Bath:</label>
                <input type="number" id="bath" name="bath" placeholder="1" />
                <label for="neighborhood_preference">Property Type:</label>
                <select
                  id="neighborhood_preference"
                  name="neighborhood_preference"
                  required
                >
                  <For each={property_type}>
                    {(item) => <option value={item}>{item}</option>}
                  </For>
                </select>
              </div>
            </li>
            <li class="min-w-full p-[20px] transition delay-50">
              <div class="flex flex-col">
                <label for="income">Income:</label>
                <select id="income" name="income" required>
                  <For each={income}>
                    {(item) => <option value={item}>{item}</option>}
                  </For>
                </select>
                <label for="household_type">Household Type:</label>
                <select id="household_type" name="household_type" required>
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
                        id="parks"
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
        <IconButton
          arial-label="next"
          id="btnNext"
          disabled={count() == 4 ? true : false}
          onClick={handleNext}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default RecommendZipcode;
