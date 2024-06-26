import { BaseLayout } from "../layouts/Layout";
import { A } from "@solidjs/router";
import magnGlass from "../assets/magn_glass_transp.png";
import appLogo from "../assets/logo_v_small.png";
import sideWaveBackground from "../assets/side-wave_background.png";

export const Home = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${sideWaveBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <BaseLayout>
        <header class="flex justify-between items-center py-4 px-8 text-white">
          <div class="flex items-center space-x-2">
            <a href="/">
              <img
                src={appLogo}
                alt="App Logo"
                style={{ width: "200px", height: "auto" }}
              />
            </a>
          </div>
        </header>
        <div class="flex flex-col md:flex-row items-center justify-between mt-8 mx-4 md:mx-16">
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
          <div class="mt-8 md:mt-0">
            <img
              src={magnGlass}
              alt="magnifying glass"
              class="w-full md:w-3/4 lg:w-1/2"
              style={{ width: "500px", height: "auto" }}
            />
          </div>
        </div>
      </BaseLayout>
    </div>
  );
};
