<script>
  import ActivityIcon from "./ActivityIcon.svelte";
  import { typeCopy, assetUrl } from "../lib/catalog.js";
  export let activity;
  $: type = typeCopy[activity.type];
</script>

<article class="activity-card">
  <span class="activity-icon {type.className}-icon" aria-hidden="true">
    <ActivityIcon name={type.icon} />
  </span>
  <div class="activity-body">
    <div class="activity-meta">
      <span class="type-label {type.className}-text">{type.singular}</span>
      {#if activity.date}
        <time>{activity.date}</time>
      {/if}
    </div>
    <h3>{activity.title}</h3>
    {#if activity.meta}
      <p>{activity.meta}</p>
    {/if}
    {#if activity.links.length}
      <div class="activity-links">
        {#each activity.links as link}
          <a href={assetUrl(link.url)} target="_blank" rel="noreferrer">
            {link.label}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" /></svg>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</article>
