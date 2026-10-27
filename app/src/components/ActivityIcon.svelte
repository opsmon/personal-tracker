<script>
  export let name;

  const paths = {
    book: [
      "M12 6.5C9.3 4.7 5.9 4.5 3 5.5v13c2.9-1 6.3-.8 9 1 2.7-1.8 6.1-2 9-1v-13c-2.9-1-6.3-.8-9 1Z",
      "M12 6.5v13"
    ],
    graduation: [
      "m3 9 9-5 9 5-9 5-9-5Z",
      "M7 11.2V16c2.7 2.6 7.3 2.6 10 0v-4.8",
      "M21 9v6"
    ],
    people: [
      "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "M16 3a4 4 0 0 1 0 8",
      "M22 21v-2a4 4 0 0 0-3-3.87"
    ],
    webinar: [
      "M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
      "m10 8 5 3-5 3V8Z",
      "M12 17v4M8 21h8"
    ],
    chart: [
      "M4 4v16h17",
      "M8 16v-4M13 16V9M18 16V5"
    ]
  };
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#each paths[name] as path}
    <path d={path} />
  {/each}
</svg>
