import { buildData } from "./lib/activity-data.mjs";

const data = buildData();
console.log(`Generated ${data.activities.length} activities for ${data.years.join(", ")}`);
