/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      boxShadow: {
        "image": "0 1px 15px #000c",
      },
      width: {
        // "narrow": "60ch",
        "narrow": "40rem",
      },
    },
  },
  plugins: [],
}
