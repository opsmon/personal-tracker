<script>
  import { typeCopy, typeKeys } from "../lib/catalog.js";
  export let year;
  export let summary;
  export let total;
</script>

<section class="hero" id="overview" aria-labelledby="page-title">
  <div class="hero-glow" aria-hidden="true"></div>
  <p class="eyebrow">Personal activity tracker · <span>{year}</span></p>
  <h1 id="page-title">Learning,<br><span>tracked.</span></h1>
  <p class="lead">
    Books that shaped my thinking, courses that sharpened my skills,
    offline events and webinars that kept me connected.
  </p>

  <div class="stats" aria-label="Yearly activity summary">
    {#each typeKeys as type}
      <article class="stat">
        <span class="stat-icon {typeCopy[type].className}s-icon" aria-hidden="true">{typeCopy[type].glyph}</span>
        <div><strong>{summary[type] || 0}</strong><span>{typeCopy[type].statLabel}</span></div>
      </article>
    {/each}
    <article class="stat total-stat">
      <span class="stat-icon total-icon" aria-hidden="true">Σ</span>
      <div><strong>{total}</strong><span>Total activities</span></div>
    </article>
  </div>
</section>
