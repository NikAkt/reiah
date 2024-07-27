import { createSignal, Suspense, Show, createEffect } from "solid-js";
import { DoughnutChart } from "./Charts";

const DemographicInfo = ({ zip }) => {
  const [familyHousehold, setFamilyHousehold] = createSignal(null);
  const [singleHousehold, setSingleHousehold] = createSignal(null);
  const [population, setPopulation] = createSignal(null);
  const [density, setDensity] = createSignal(null);
  const [income, setIncome] = createSignal(null);
  const [race, setRace] = createSignal({});
  const [gender, setGender] = createSignal({});

  const fetchDemographicData = () => {
    fetch(`http://localhost:8000/api/demographic?zipcode=${zip()}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const obj = data[0];

          const gender_labels = ["Male", "Female"];
          const gender_data = [obj["Male"], obj["Female"]];

          const gender_datasets = {
            labels: gender_labels,
            datasets: [{ label: "Gender", data: gender_data }],
          };
          setGender(gender_datasets);

          const race_labels = [
            "white",
            "asian",
            "black",
            "pacific_islander",
            "american_indian",
            "other",
          ];
          const race_data = [
            obj["white"],
            obj["asian"],
            obj["black"],
            obj["pacific_islander"],
            obj["american_indian"],
            obj["other"],
          ];

          const race_datasets = {
            labels: race_labels,
            datasets: [{ label: "Diversity", data: race_data }],
          };

          setRace(race_datasets);

          try {
            setFamilyHousehold(obj["FamilyHousehold"]);
            setIncome(obj["MedianHouseholdIncome"]);
            setSingleHousehold(obj["SingleHousehold"]);
            setPopulation(obj["Population"]);
            setDensity(obj["PopulationDensity"]);
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching demographic data:", error);
      });
  };

  createEffect(() => {
    fetchDemographicData();
  });

  return (
    <div id="demographic-info" class="dark:text-white">
      <p class="text-xl py-4">Demographic Information</p>
      <div class="grid grid-cols-1 gap-4 py-4">
        <div class="p-4 shadow-lg rounded-lg border border-gray-300 space-y-2">
          <div class="text-lg">Family Household: {familyHousehold()}</div>
          <div class="text-lg">Single Household: {singleHousehold()}</div>
          <div class="text-lg">Population: {population()}</div>
          <div class="text-lg">Population Density: {density()}</div>
          <div class="text-lg">Median Household Income: ${income()}</div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 shadow-lg rounded-lg border border-gray-300">
            <Suspense>
              <Show when={gender()}>
                <div class="bg-teal-500 text-white text-center rounded-t-lg py-2 mb-4">
                  Gender:
                </div>
                <div class="flex justify-center">
                  <DoughnutChart datasets={gender()} type="gender" />
                </div>
              </Show>
            </Suspense>
          </div>
          <div class="p-4 shadow-lg rounded-lg border border-gray-300">
            <Suspense>
              <Show when={race()}>
                <div class="bg-teal-500 text-white text-center rounded-t-lg py-2 mb-4">
                  Race Diversity:
                </div>
                <div class="flex justify-center">
                  <DoughnutChart datasets={race()} type="race" />
                </div>
              </Show>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicInfo;
