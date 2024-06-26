import { Sidebar, DarkLightModeToggle } from "../components/Sidebar";
import { SortableGroup } from "../components/SortableWrapper";
import { Navbar } from "../components/Navbar";
import { setStore, store } from "../data/stores";
import { Show } from "solid-js";

const links = [
  { Href: "/map", Title: "Map" },
  { Href: "/settings", Title: "Settings" },
  { Href: "/dashboard", Title: "Dashboard" },
];

const BaseLayout = ({ children }) => {
  return (
    <div
      class="min-h-screen bg-gray-200"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      {children}
    </div>
  );
};

const DashboardView = (props) => {
  return (
    <BaseLayout>
      <Sidebar links={links} />
      <main
        class="z-10 w-full bg-gray-100 dark:bg-gray-900 min-h-screen"
        onMouseOver={() => setStore({ ...store, sidebarOpen: false })}
      >
        <Navbar />
        <Show when={props.sortableIsOn}>
          <SortableGroup class="p-8 grid grid-cols-3 gap-4">
            {props.children}
          </SortableGroup>
        </Show>
        <Show when={!props.sortableIsOn}>
          <div class="p-8 grid grid-cols-3 gap-4">{props.children}</div>
        </Show>
      </main>
    </BaseLayout>
  );
};

const MapView = (props) => {
  return (
    <BaseLayout>
      <Sidebar links={links} />
      <main
        class="z-10 w-full bg-gray-100 dark:bg-gray-900 min-h-screen"
        onMouseOver={() => setStore({ ...store, sidebarOpen: false })}
      >
        <div>{props.children}</div>
      </main>
    </BaseLayout>
  );
};

const AuthLayout = (props) => {
  return (
    <BaseLayout>
      <div class="h-screen grid grid-cols-2 gap-0 overflow-hidden">
        <div class="h-full flex justify-center items-center bg-white dark:bg-slate-800">
          {props.children}
        </div>
        <div class="h-full bg-gradient-to-br from-teal-500 to-green-200 dark:from-teal-300 dark:to-green-950 p-48 flex justify-center items-center flex-col">
          <div class="fixed right-4 top-4">
            <DarkLightModeToggle />
          </div>
          <h2 class="text-white  text-center text-3xl">
            Join the 2 other investors using REIAH today!!
          </h2>
          <p class="text-white  text-center text-md mt-12">
            wether you are looking for that next big investment or a place to
            call your own REIAH is here to guide you in the right direction.
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

export { AuthLayout, MapView, DashboardView, BaseLayout };
