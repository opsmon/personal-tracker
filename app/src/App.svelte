<script>
  import data from "./generated/activities.json";
  import Header from "./components/Header.svelte";
  import Overview from "./components/Overview.svelte";
  import MonthlyChart from "./components/MonthlyChart.svelte";
  import Glossary from "./components/Glossary.svelte";
  import Timeline from "./components/Timeline.svelte";
  import Footer from "./components/Footer.svelte";
  import { groupByMonth, summarize } from "./lib/catalog.js";

  let year = data.year;
  let monthFilter = null;
  $: activities = data.activities.filter((activity) => activity.year === Number(year));
  $: summary = summarize(activities);
  $: total = activities.length;
  $: monthTotals = Object.values(groupByMonth(activities)).map((items) => items.length);

  function toggleMonth(month) {
    monthFilter = monthFilter === month ? null : month;
    document.querySelector("#timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

<Header />
<main>
  {#if data.years.length > 1}
    <label class="year-picker">
      Year
      <select bind:value={year} onchange={() => monthFilter = null}>
        {#each data.years as availableYear}
          <option value={availableYear}>{availableYear}</option>
        {/each}
      </select>
    </label>
  {/if}
  <Overview {year} {summary} {total} />
  <MonthlyChart {monthTotals} {monthFilter} onToggleMonth={toggleMonth} />
  <Glossary />
  <Timeline {activities} {summary} {total} {monthFilter} />
</main>
<Footer />
