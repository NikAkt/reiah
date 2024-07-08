import { DashboardView } from "../layouts/Layout";
import UserMenu from "../components/UserMenu"; // Import UserMenu component

export const Dashboard = () => {
  return (
    <DashboardView sortableIsOn={true}>
      <div class="absolute top-0 right-0 p-4">
        <UserMenu /> {/* Include UserMenu component */}
      </div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 col-span-2 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 col-span-2 p-4"></div>
    </DashboardView>
  )
}
