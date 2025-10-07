export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Poppins','sans-serif'],
        body: ['Inter','system-ui','sans-serif']
      },
      colors: {
        primary: { 500: '#6366f1' }, // indigo
        accent: { 500: '#f43f5e' },  // rose
        success: { 500: '#10b981' }, // emerald
      }
    }
  },
  plugins: [],
}
