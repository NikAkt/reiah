import { InductionView } from "../layouts/Layout";
import induction_1 from "../assets/induction/step1.png";
import induction_1_2 from "../assets/induction/step1.2.png";
import induction_1_3 from "../assets/induction/step1.3.png";
import induction_1_4 from "../assets/induction/step1.4.png";
import induction_2 from "../assets/induction/step2.png";
import induction_2_1 from "../assets/induction/step2.1.png";
import induction_2_1_1 from "../assets/induction/step2.1.1.png";
import induction_2_1_2 from "../assets/induction/step2.1.2.png";
import induction_2_1_3 from "../assets/induction/step2.1.3.png";

import induction_3 from "../assets/induction/step3.png";
import induction_3_1 from "../assets/induction/step3.1.png";
import induction_3_2 from "../assets/induction/step3.2.png";
import induction_3_3 from "../assets/induction/step3.3.png";

import induction_4 from "../assets/induction/step4.png";

const InductionPage = () => {
  return (
    <InductionView>
      <div
        class="flex flex-col items-center justify-center 
      border-2 border-solid border-black"
      >
        <div id="induction_step1">
          <div>
            <div class="text-2xl">
              Step 1 Find the zip code you are interested in
            </div>
            <img src={induction_1} class="w-[60%] h-[60%]" />
          </div>

          <div class="flex flex-col gap-2">
            <div>
              <h2 class="text-xl">Search Bar</h2>
              <img src={induction_1_2} class="w-[60%] h-[60%]" />
            </div>
            <div>
              <h2 class="text-xl">Filter</h2>
              <img src={induction_1_3} class="w-[60%] h-[60%]" />
            </div>
            <div>
              <h2 class="text-xl">Recommend</h2>
              <img src={induction_1_4} class="w-[60%] h-[60%]" />
            </div>
          </div>
        </div>
        <div id="induction_step2">
          <div class="text-2xl">
            Step 2: Check the information in the dashboard
          </div>
          <img src={induction_2} class="w-[60%] h-[60%]" />
          <h2>Real Estate Information</h2>
          <img src={induction_2_1} class="w-[60%] h-[60%]" />
          <img src={induction_2_1_1} class="w-[60%] h-[60%]" />
          <img src={induction_2_1_2} class="w-[60%] h-[60%]" />
          <img src={induction_2_1_3} class="w-[60%] h-[60%]" />

          <h2>Amenities Information</h2>
          <img src={induction_3} class="w-[60%] h-[60%]" />
          <img src={induction_3_1} class="w-[60%] h-[60%]" />
          <img src={induction_3_2} class="w-[60%] h-[60%]" />
          <img src={induction_3_3} class="w-[60%] h-[60%]" />

          <h2>Other Information</h2>
          <img src={induction_4} class="w-[60%] h-[80%]" />
        </div>
      </div>
    </InductionView>
  );
};

export { InductionPage };
