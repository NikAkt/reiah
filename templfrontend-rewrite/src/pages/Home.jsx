import { BaseLayout } from "../layouts/Layout";
import { A } from "@solidjs/router";

export const Home = () => {
  return (
    <BaseLayout>
      <header>
        <a
          href="/dashboard"
          class="flex items-center py-2 px-4 text-gray-900 hover:bg-gray-950 hover:text-gray-100 rounded-md"
        >
          <span class="text-lg">Go To Dashboard</span>
        </a>
      </header>
      <div class="mt-8 text-3xl">
        <h1>Landing Page</h1>
      </div>
    </BaseLayout>
  )
}
