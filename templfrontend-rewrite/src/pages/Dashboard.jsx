import { DashboardView } from "../layouts/Layout";

export const Dashboard = () => {
  return (
    <DashboardView sortableIsOn={true}>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 col-span-2 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 p-4"></div>
      <div class="min-h-80 shadow-md rounded bg-white dark:bg-slate-800 col-span-2 p-4"></div>
    </DashboardView>
  )
}
