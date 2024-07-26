import { HomeScreenLayout } from "../layouts/Layout";
import houseSVG from "../assets/house-svgrepo-com.svg";
import housemodernSVG from "../assets/house-modern.svg";
import appLogo from "../assets/logo_v_small.png";

// url(${sideWaveBackground})
// USE GRID FOR PAGE LAYOUT AND FLEX FOR DIV LAYOUT
export const Home = () => {
  return (
    <>
      <HomeScreenLayout>
        <header class="flex justify-between px-8 lg:px-16 py-8 text-white">
          <a href="/">
            <img src={appLogo} alt="App Logo" class="w-28 lg:w-48 h-auto" />
          </a>
          <ul class="flex gap-4 md:gap-10">
            <a
              class="font-poppins-regular text-xl hover:text-gray-500 transition-colors duration-300"
              href="/map"
            >
              Map
            </a>
            <a
              class="font-poppins-regular text-xl hover:text-gray-500 transition-colors duration-300"
              href="/settings"
            >
              Settings
            </a>
          </ul>
        </header>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 lg:p-16">
          <div class="text-left lg:max-w-md">
            <h1 class="font-poppins-regular text-3xl lg:text-4xl font-bold text-teal-500">
              Accelerate your real estate journey
            </h1>
            <span class="font-poppins-regular text-teal-500 italic text-lg">
              Pronounced "ray-ah"
            </span>
            <p class="font-poppins-regular mt-4 text-gray-700 text-xl lg:text-2xl">
              Reiah helps you discover the perfect ZIP code to invest your
              residential property. Our platform provides the insights and tools
              you need to accelerate your investment journey.
            </p>
            <p class="font-poppins-regular mt-4 text-gray-700 lg:text-2xl">
              Unlock the potential of your next real estate venture with Reiah!
            </p>
            <div class="mt-6 flex space-x-4">
              <a
                href="/login"
                class="font-poppins-regular inline-block bg-teal-500 text-white text-xl lg:text-2xl py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Log In
              </a>
              <a
                href="/register"
                class="font-poppins-regular inline-block bg-teal-500 text-white text-xl lg:text-2xl py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Register
              </a>
            </div>
          </div>
          <div class="hidden md:flex flex-col justify-center items-center">
            <div class="flex justify-center items-center">
              <img src={houseSVG} alt="house svg yay!" class="h-72 lg:h-96 mr-4 mb-4" />
            </div>
            <div class="flex justify-center items-center">
              {/* <img src={storeSVG} alt="store svg" class="h-72 mr-4" /> */}
            </div>
          </div>
        </div>
      </HomeScreenLayout>
    </>
  );
};
