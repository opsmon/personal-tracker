<script>
  import { onMount } from "svelte";
  import ActivityCard from "./ActivityCard.svelte";
  import { monthNames, typeCopy, typeKeys, filterActivities, groupByMonth } from "../lib/catalog.js";

  export let activities;
  export let summary;
  export let total;
  export let monthFilter;
  const filters = ["all", ...typeKeys];
  let filter = "all";
  let query = "";
  let searchInput;

  $: filteredActivities = filterActivities(activities, { filter, query, month: monthFilter });
  $: activitiesByMonth = groupByMonth(filteredActivities);

  function badgeFor(type) {
    return type === "all" ? total : summary[type] || 0;
  }

  onMount(() => {
    function handleKeydown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput?.focus();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });
</script>

<section class="timeline-section" id="timeline" aria-labelledby="timeline-title">
  <div class="section-heading timeline-heading">
    <div>
      <p class="section-kicker">Activity</p>
      <h2 id="timeline-title">The year in detail.</h2>
    </div>
    <label class="search">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.75"></circle>
        <path d="m16 16 4.25 4.25"></path>
      </svg>
      <span class="sr-only">Search activities</span>
      <input bind:this={searchInput} bind:value={query} type="search" placeholder="Search titles, authors, providers…" autocomplete="off">
    </label>
  </div>

  <div class="filters" role="group" aria-label="Filter activities">
    {#each filters as filterName}
      <button
        class:is-active={filter === filterName}
        class="filter"
        type="button"
        aria-pressed={filter === filterName}
        onclick={() => filter = filterName}
      >
        {filterName === "all" ? "All" : typeCopy[filterName].label}
        <span>{badgeFor(filterName)}</span>
      </button>
    {/each}
  </div>

  <div class="timeline" aria-live="polite">
    {#each monthNames as month}
      {@const activities = activitiesByMonth[month]}
      {#if activities.length}
        <section class="month-group" id="month-{month.toLowerCase()}">
          <div class="month-label">
            <span>{month}</span>
            <small>{activities.length}</small>
          </div>
          <div class="month-items">
            {#each activities as activity}
              <ActivityCard {activity} />
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
  {#if filteredActivities.length === 0}
    <p class="empty">No matching activities found.</p>
  {/if}
</section>
