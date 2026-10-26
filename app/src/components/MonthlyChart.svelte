<script>
  import { monthNames, pluralize } from "../lib/catalog.js";
  export let monthTotals;
  export let monthFilter;
  export let onToggleMonth;
  const shortMonths = monthNames.map((month) => month.slice(0, 3));
  $: maxMonthTotal = Math.max(...monthTotals, 1);
  $: activeMonthCount = monthTotals.filter((count) => count > 0).length;
  $: activeMonthsLabel = monthFilter
    ? `Showing ${monthFilter}: ${monthTotals[monthNames.indexOf(monthFilter)] || 0} ${pluralize("activity", monthTotals[monthNames.indexOf(monthFilter)] || 0)}`
    : `Activity across ${activeMonthCount} ${pluralize("month", activeMonthCount)}`;
</script>

<section class="pulse" aria-labelledby="pulse-title">
  <div class="section-heading">
    <div>
      <p class="section-kicker">Year at a glance</p>
      <h2 id="pulse-title">A steady learning pulse.</h2>
    </div>
    <p>{activeMonthsLabel}</p>
  </div>
  <div class="chart" aria-label="Activities per month">
    {#each monthNames as month, index}
      {@const totalForMonth = monthTotals[index]}
      {@const isActive = monthFilter === month}
      <button
        class:is-active={isActive}
        class="chart-column"
        type="button"
        aria-pressed={isActive}
        aria-label="{isActive ? 'Clear' : 'Show'} {month} filter, {totalForMonth} {pluralize('activity', totalForMonth)}"
        title="{month}: {totalForMonth}"
        onclick={() => onToggleMonth(month)}
      >
        <div class="chart-value">{totalForMonth || ""}</div>
        <div class="chart-track">
          <span style:height={`${totalForMonth ? Math.max(8, (totalForMonth / maxMonthTotal) * 100) : 3}%`}></span>
        </div>
        <small>{shortMonths[index]}</small>
      </button>
    {/each}
  </div>
</section>
