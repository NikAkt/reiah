import { useLocation } from "@solidjs/router";
import logo from "../logo.svg";

export default function Nav() {
  const location = useLocation();

  return (
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div class="relative flex h-16 items-center justify-between">
          <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div class="flex flex-shrink-0 items-center">
              <a href="/">
                <img class="w-8 h-8 mr-2" alt="logo" src={logo}></img>
              </a>
            </div>
            <div class="hidden sm:ml-6 sm:block">
              <div class="flex space-x-4">
                <a
                  href="app"
                  class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname === "app" ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                >
                  App
                </a>
                <a
                  href="login"
                  class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname === "login" ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                >
                  Login
                </a>
                <a
                  href="register"
                  class={`rounded-md px-3 py-2 text-sm font-medium ${location.pathname === "register" ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                >
                  Register
                </a>
              </div>
            </div>
          </div>
          <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"></div>
        </div>
      </div>

      <div class="sm:hidden" id="mobile-menu">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <a
            href="#"
            class="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium"
            aria-current="page"
          >
            Dashboard
          </a>
          <a
            href="#"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
          >
            Team
          </a>
          <a
            href="#"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
          >
            Projects
          </a>
          <a
            href="#"
            class="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
          >
            Calendar
          </a>
        </div>
      </div>
    </nav>
  );
}
