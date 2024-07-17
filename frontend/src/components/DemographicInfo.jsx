import { createSignal, Suspense, Show, createEffect, onMount } from "solid-js";
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
      <div class="grid grid-cols-1 divide-y gap-2">
        <div class="grid grid-cols-1 divide-y">
          <div>Family Household: {familyHousehold()}</div>
          <div>Single Household: {singleHousehold()}</div>
          <div>Population: {population()}</div>
          <div>Population Density: {density()}</div>
          <div>Median Household Income: {income()}</div>
          <div class="grid grid-cols-2">
            <div>
              <Suspense>
                <Show when={gender()}>
                  <p class="bg-teal-500 text-white text-center">Gender:</p>
                  <DoughnutChart datasets={gender()} type="gender" />
                </Show>
              </Suspense>
            </div>
            <div>
              <Suspense>
                <Show when={race()}>
                  <p class="bg-teal-500 text-white text-center">
                    Race Diversity:
                  </p>
                  <DoughnutChart datasets={race()} type="race" />
                </Show>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicInfo;
