/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        grey: {
          1: "#7f7f7f",
          2: "#888888",
          3: "#a5a5a5",
          4: "#bfbfbf",
          5: "#d8d8d8",
          6: "#f2f2f2",
          7: "#fafafa",
        },
      },
      boxShadow: {
        image: "0 1px 12px #000b",
      },
      width: {
        // "narrow": "60ch",
        // "narrower": "34rem",
        narrow: "40rem",
        wide: "68rem",
      },
      transitionTimingFunction: {
        "out-cubic": "cubic-bezier(0.33, 1, 0.68, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-circ": "cubic-bezier(0, 0.55, 0.45, 1)",
        "out-smooth": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
