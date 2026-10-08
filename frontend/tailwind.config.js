/** Palette Copa Cabana : plage, soirée, cadre. Modifier ici si le restaurant a une charte officielle. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nuit: '#06262E',    // fond principal, ciel de nuit
        lagon: '#14A3A0',   // turquoise de l'eau, actions
        mangue: '#F9B233',  // soleil, accents et prix
        hibiscus: '#D62E4E',// alertes, mise en avant
        ecume: '#F1F8F6',   // fond clair
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
};
