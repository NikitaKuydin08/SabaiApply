import { getPlatformStats } from "../actions";
import SuperDashboardClient from "./dashboard-client";

export default async function SuperDashboardPage() {
  const stats = await getPlatformStats();
  return <SuperDashboardClient stats={stats} />;
}
