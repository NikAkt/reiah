import { HomeScreenLayout } from "../layouts/Layout";
import magnGlass from "../assets/magn_glass_transp.png";
import houseSVG from "../assets/house-svgrepo-com.svg"
import appLogo from "../assets/logo_v_small.png";

// url(${sideWaveBackground})
// USE GRID FOR PAGE LAYOUT AND FLEX FOR DIV LAYOUT
export const Home = () => {
  return (
    <>
      <HomeScreenLayout>
        <header class="flex justify-between items-center px-16 py-8 text-white">
          <a href="/">
            <img
              src={appLogo}
              alt="App Logo"
              class="w-48 h-auto"
            />
          </a>
          <ul class="flex gap-4">
            <a class="text-lg" href="/dashboard">Dashboard</a>
            <a class="text-lg" href="/dashboard">Dashboard</a>
            <a class="text-lg" href="/dashboard">Dashboard</a>
            <a class="text-lg" href="/dashboard">Dashboard</a>
          </ul>
        </header>
        <div class="grid grid-cols-2 gap-4 p-16">
          <div class="text-left max-w-md">
            <h1 class="text-4xl font-bold text-teal-500">
              Accelerate your real estate journey
            </h1>
            <span class="text-sm text-teal-500 italic">Pronounced ray-ah</span>
            <p class="mt-4 text-gray-700">
              Reiah helps you discover the perfect zip code to invest in,
              whether it's for residential or commercial purposes. Our platform
              provides the insights and tools you need to accelerate your
              investment journey. Unlock the potential of your next real estate
              venture with Reiah!
            </p>
            <div class="mt-6 flex space-x-4">
              <a
                href="/login"
                class="inline-block bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Log In
              </a>
              <a
                href="/signup"
                class="inline-block bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Sign Up
              </a>
            </div>
          </div>
          <div class="flex justify-center items-center">
            <img
              src={houseSVG}
              alt="house svg yay!"
              class="h-72"
            />
          </div>
        </div>
      </HomeScreenLayout>
    </>
  );
};
