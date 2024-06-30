import { HomeScreenLayout } from "../layouts/Layout";
import restaurantSVG from "../assets/restaurant.svg";
import storeSVG from "../assets/store.svg";
import houseSVG from "../assets/house-svgrepo-com.svg";
import housemodernSVG from "../assets/house-modern.svg";
import appLogo from "../assets/logo_v_small.png";

// url(${sideWaveBackground})
// USE GRID FOR PAGE LAYOUT AND FLEX FOR DIV LAYOUT
export const Home = () => {
  return (
    <>
      <HomeScreenLayout>
        <header class="flex justify-between items-center px-16 py-8 text-white">
          <a href="/">
            <img src={appLogo} alt="App Logo" class="w-48 h-auto" />
          </a>
          <ul class="flex gap-10">
            <a
              class="font-poppins-regular-regular text-xl hover:text-gray-500 transition-colors duration-300"
              href="/dashboard"
            >
              Dashboard
            </a>
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
        <div class="grid grid-cols-2 gap-4 p-16">
          <div class="text-left max-w-md">
            <h1 class="font-poppins-regular text-4xl font-bold text-teal-500">
              Accelerate your real estate journey
            </h1>
            <span class="font-poppins-regular text-teal-500 italic text-lg">
              Pronounced "ray-ah"
            </span>
            <p class="font-poppins-regular mt-4 text-gray-700 text-2xl">
              Reiah helps you discover the perfect ZIP code to invest in.
              Whether it's for residential or commercial purposes, our platform
              provides the insights and tools you need to accelerate your
              investment journey.
            </p>
            <p class="font-poppins-regular mt-4 text-gray-700 text-2xl">
              Unlock the potential of your next real estate venture with Reiah!
            </p>
            <div class="mt-6 flex space-x-4">
              <a
                href="/login"
                class="font-poppins-regular inline-block bg-teal-500 text-white text-2xl py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Log In
              </a>
              <a
                href="/signup"
                class="font-poppins-regular inline-block bg-teal-500 text-white text-2xl py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Sign Up
              </a>
            </div>
          </div>
          <div class="flex flex-col justify-center items-center">
            <div class="flex justify-center items-center">
              <img src={houseSVG} alt="house svg yay!" class="h-72 mr-4 mb-4" />
              <img src={restaurantSVG} alt="restaurant svg" class="h-72 mb-4" />
            </div>
            <div class="flex justify-center items-center">
              <img src={storeSVG} alt="store svg" class="h-72 mr-4" />
              <img src={housemodernSVG} alt="house modern svg" class="h-72" />
            </div>
          </div>
        </div>
      </HomeScreenLayout>
    </>
  );
};
