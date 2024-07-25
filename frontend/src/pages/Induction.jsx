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
        className="mt-[2%] grid grid-row-1 divide-y justify-center 
      w-4/5 min-h-screen text-center py-3"
      >
        <h1 class="text-2xl">User Induction</h1>
        <div class="text-xl">
          Welcome to Reiah! Thanks for coming here. We hope you can be clearer
          how to use our application here.
        </div>
        {/* a tags */}
        {/* <div
          class="relative grid grid-cols-2 gap-10 mt-[2%]
        mx-auto mb-[2vh] text-xl text-center
             items-center justify-center"
        >
          <a href="#induction_step1">step 1</a>
          <a href="#induction_step2">step 2</a>
        </div> */}
        <div
          id="induction_step1"
          className="flex flex-col items-center w-full py-3"
        >
          <div className="text-2xl text-center mb-4">Map Page</div>

          {/* a tags */}
          <div
            class="relative grid grid-cols-7 mx-auto divide-x mb-[2vh]
             items-center justify-center"
          >
            <a href="#side_bar">Side Bar</a>
            <a href="#side_bar">Account Button</a>
            <a href="#side_bar">Zip code Layer</a>
            <a href="#search_bar">Search Bar</a>
            <a href="#filter">Filter</a>
            <a href="#recommend">Recommend</a>
            <a href="#side_bar">Dashboard</a>
          </div>
          <div className="w-full flex justify-center mb-4">
            <img
              src={induction_1}
              className="w-[60%] h-auto"
              class="hover:scale-150 duration-300 hover:z-10"
            />
          </div>

          <div className="flex flex-col gap-4 items-center w-full">
            <div className="w-full flex flex-col items-center" id="search_bar">
              <h2 className="text-xl">Search Bar</h2>
              <img
                src={induction_1_2}
                className="w-[60%] h-auto"
                class="hover:scale-150 duration-300 hover:z-10"
              />
            </div>
            <div className="w-full flex flex-col items-center" id="filter">
              <h2 className="text-xl">Filter</h2>
              <img
                src={induction_1_3}
                className="w-[60%] h-auto"
                class="hover:scale-150 duration-300 hover:z-10"
              />
            </div>
            <div className="w-full flex flex-col items-center" id="recommend">
              <h2 className="text-xl">Recommend</h2>
              <img
                src={induction_1_4}
                className="w-[60%] h-auto"
                class="hover:scale-150 duration-300 hover:z-10"
              />
            </div>
          </div>
        </div>
        <div
          id="induction_step2"
          className="flex flex-col items-center w-full mt-8 py-3"
        >
          <div className="text-2xl text-center mb-4">
            Step 2: Check the information in the dashboard
          </div>
          <div
            class="relative grid grid-cols-3 mx-auto gap-10 mb-[2vh]
             items-center justify-center"
          >
            <a href="#realEstateInfo">real estate information</a>
            <a href="#amenitiesInfo">amenities information</a>
            <a href="#recommendInfo">other information</a>
          </div>
          <div className="w-full flex justify-center mb-4">
            <img
              src={induction_2}
              className="w-[60%] h-auto"
              class="hover:scale-150 duration-300 hover:z-10"
            />
          </div>

          <div
            className="w-full flex flex-col items-center mb-8"
            id="realEstateInfo"
          >
            <h2 className="text-xl">Real Estate Information</h2>
            <img
              src={induction_2_1}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <h3>Historical Property Value Chart</h3>
            <img
              src={induction_2_1_1}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <h3>2023 Sales</h3>
            <img
              src={induction_2_1_2}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <h3>2024 Sales Prediction</h3>
            <img
              src={induction_2_1_3}
              className="w-[60%] h-auto"
              class="hover:scale-150 duration-300 hover:z-10"
            />
          </div>

          <div
            className="w-full flex flex-col items-center mb-8"
            id="amenitiesInfo"
          >
            <h2 className="text-xl">Amenities Information</h2>
            <img
              src={induction_3}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <img
              src={induction_3_1}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <img
              src={induction_3_2}
              className="w-[60%] h-auto mb-4"
              class="hover:scale-150 duration-300 hover:z-10"
            />
            <img
              src={induction_3_3}
              className="w-[60%] h-auto"
              class="hover:scale-150 duration-300 hover:z-10"
            />
          </div>

          <div className="w-full flex flex-col items-center" id="otherInfo">
            <h2 className="text-xl">Other Information</h2>
            <img
              src={induction_4}
              className="w-[60%] h-auto"
              class="hover:scale-150 duration-300 hover:z-10"
            />
          </div>
        </div>
      </div>
    </InductionView>
  );
};

export { InductionPage };
