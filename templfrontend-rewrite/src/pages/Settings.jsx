import { SettingsForm } from "../components/SettingsForm";
import { DashboardView } from "../layouts/Layout";

const initialValues = {
  Username: "john_doe",
  Email: "john@example.com",
  Name: "John",
  Surname: "Doe",
};

export const Settings = () => {
  return (
    <DashboardView sortableIsOn={false}>
      <div class="p-8 shadow-md rounded bg-white dark:bg-slate-800 col-span-3">
        <header>
          <h1 class="text-2xl dark:text-white">User Settings</h1>
        </header>
        <main class="mt-4">
          <SettingsForm
            editOn={true}
            userId="123"
            values={initialValues}
            errors={{}}
          />
        </main>
      </div>
    </DashboardView>
  );
};
