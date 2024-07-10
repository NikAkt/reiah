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

const RecommendZipcodeCard = ({ title, content }) => {
  return (
    <div class="w-[90%] flex flex-col">
      <div>Title</div>
      <div>
        <For each={content} fallback={<div>Loading...</div>}>
          {(item) => (
            <input
              type="checkbox"
              id={`recommendCheckbox-${item}`}
              name={`recommendCheckbox-${item}`}
              value={item}
            >
              {item}
            </input>
          )}
        </For>
      </div>
    </div>
  );
};

const RecommendZipcode = (props) => {
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

  return (
    <div
      class="absolute z-30 w-[500px] h-[500px] left-[20vw] top-[10vh]
     border-solid bg-white"
    >
      <div id="recommend-header" class="relative top-[0] bg-black text-white">
        Recommend
      </div>
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
      <div id="recommend-content" class="overflow-y-auto grid divide-y">
        <label for="sqft">Square Footage:</label>
        <input type="number" id="sqft" name="sqft" required />

        <label for="sqft">Beds:</label>
        <input type="number" id="beds" name="beds" placeholder="1" />

        <label for="sqft">Bath:</label>
        <input type="number" id="bath" name="bath" placeholder="1" />

        <label for="income">Income:</label>
        <select id="income" name="income" required>
          <For each={income}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>

        <label for="neighborhood_preference">Neighborhood Preference:</label>
        <select
          id="neighborhood_preference"
          name="neighborhood_preference"
          required
        >
          <For each={neighbourhood_type}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>

        <label for="household_type">Household Type:</label>
        <select id="household_type" name="household_type" required>
          <For each={household_type}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>

        <label for="business_environment">Business Environment:</label>
        <select id="business_environment" name="business_environment" required>
          <For each={business_environment}>
            {(item) => <option value={item}>{item}</option>}
          </For>
        </select>

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

        <label for="amenity_preferences">Amenity Preferences:</label>
        <label for="parks">Parks and recreation</label>
        <input
          type="checkbox"
          id="parks"
          name="amenity_preferences"
          value="Parks and recreation"
        />
        <label for="public_transportation">Public transportation</label>
        <input
          type="checkbox"
          id="public_transportation"
          name="amenity_preferences"
          value="Public transportation"
        />
        <label for="shopping_centers">Shopping centers</label>
        <input
          type="checkbox"
          id="shopping_centers"
          name="amenity_preferences"
          value="Shopping centers"
        />
        <label for="schools">Schools</label>
        <input
          type="checkbox"
          id="schools"
          name="amenity_preferences"
          value="Schools"
        />

        <input type="submit" value="Submit"></input>
      </div>
      <div
        id="recommend-footer"
        class="relative bottom-[0] bg-black text-white"
      >
        <button>Clear All</button>
        <button>Recommend!</button>
      </div>
    </div>
  );
};

export default RecommendZipcode;
