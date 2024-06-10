import { useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import filter_img from "/assets/Filter.png";

export default function Nav() {
  const location = useLocation();
  const active = (path) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";

  const [dropdownDisplay, setDropdownDisplay] = createSignal(false);

  const toggleDropdown = () => {
    setDropdownDisplay(!dropdownDisplay());
  };

  return (
    <nav class="bg-blue h-[5vh] flex justify-items-center items-center">
      <ul class="container flex p-3 text-gray-200">
        <li
          class={`border-b-2 ${active(
            "/"
          )} mx-1.5 sm:mx-6 hover:bg-indigo-600 w-[100%]`}
        >
          <a href="/">Home</a>
        </li>

        <li
          class={`border-b-2 ${active(
            "/induction"
          )} mx-1.5 sm:mx-6 flex flex-row gap-2 hover:bg-indigo-600 w-[100%]`}
        >
          <a href="/induction">Induction</a>
        </li>
        <li
          class={`border-b-2 ${active(
            "/about"
          )} mx-1.5 sm:mx-6 flex flex-row gap-2 hover:bg-indigo-600 w-[100%]`}
        >
          <img src={filter_img} alt="filter" />
          <a href="/filter">Filter</a>
        </li>

        <li
          class={`border-b-2 ${active(
            "/about"
          )} mx-1.5 sm:mx-6 hover:bg-indigo-600 w-[100%]`}
        >
          <a href="/login">Login / Register</a>
        </li>
      </ul>
    </nav>
  );
}
