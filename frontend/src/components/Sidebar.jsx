import { store, setStore } from "../data/stores";
import { For } from "solid-js";

const DarkLightModeToggle = () => {
  return (
    <>
      <div
        class="h-7 aspect-square hover:cursor-pointer"
        onClick={() => {
          setStore({ ...store, darkModeOn: !store.darkModeOn });
        }}
      >
        <svg
          class="h-full w-full fill-black dark:fill-white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#a)">
            <path d="M12 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM4.929 3.515a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 0 0 1.414-1.414L4.93 3.515ZM1 11a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H1ZM18 12a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM17.657 16.243a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 1 0 1.414-1.414l-2.828-2.828ZM7.757 17.657a1 1 0 1 0-1.414-1.414L3.515 19.07a1 1 0 1 0 1.414 1.414l2.828-2.828ZM20.485 4.929a1 1 0 0 0-1.414-1.414l-2.828 2.828a1 1 0 1 0 1.414 1.414l2.828-2.828ZM13 19a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"></path>
          </g>
          <defs>
            <clipPath id="a">
              <path d="M0 0h24v24H0z"></path>
            </clipPath>
          </defs>
        </svg>
      </div>
    </>
  );
};

// A template for the navigation links which allows for easily adding more
const SidebarLink = (props) => {
  return (
    <li class="mb-1 group">
      <a
        href={props.link.Href}
        class="flex items-center py-2 px-4 text-gray-900 dark:text-slate-200 
        hover:bg-gray-950 hover:text-gray-100 dark:hover:text-gray-950 dark:hover:bg-gray-100 rounded-md"
      >
        <span class="text-lg">{props.link.Title}</span>
      </a>
    </li>
  );
};

// This is the exported sidebar component which will actually be used in the page layouts
const Sidebar = (props) => {
  return (
    <>
      <div
        class="fixed top-0 w-5 min-h-screen left-0 bg-transparent z-40"
        onMouseEnter={() => setStore({ ...store, sidebarOpen: true })}
      ></div>
      <div
        class={`fixed top-0 left-0 min-h-screen p-4 z-50 shadow-md bg-white dark:bg-slate-800 w-60 transition ${store.sidebarOpen ? "" : "-translate-x-60"}`}
      >
        <div class="flex items-center justify-between pb-4 border-b border-b-gray-800">
          <a href="/" class="flex items-center" hx-boost="true">
            <h2 class="font-bold text-2xl text-black dark:text-white">
              REIAH{" "}
              <span class="bg-teal-500 dark:bg-teal-300 text-white dark:text-black px-2 rounded-md">
                HUB
              </span>
            </h2>
          </a>
          <DarkLightModeToggle />
        </div>
        <ul class="mt-4" hx-boost="true">
          <For each={props.links}>{(link) => <SidebarLink link={link} />}</For>
        </ul>
      </div>
    </>
  );
};

export { Sidebar, DarkLightModeToggle };
