import { League_Spartan } from 'next/font/google'

// Configure League Spartan with various weights
export const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-league-spartan',
  display: 'swap', // Optimizes font loading
  fallback: ['Inter', 'system-ui', 'sans-serif'],
})

// Individual weight configurations for specific use cases
export const leagueSpartanLight = League_Spartan({
  subsets: ['latin'],
  weight: ['300'],
  variable: '--font-league-spartan-light',
  display: 'swap',
})

export const leagueSpartanRegular = League_Spartan({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-league-spartan-regular',
  display: 'swap',
})

export const leagueSpartanMedium = League_Spartan({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-league-spartan-medium',
  display: 'swap',
})

export const leagueSpartanSemibold = League_Spartan({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-league-spartan-semibold',
  display: 'swap',
})

export const leagueSpartanBold = League_Spartan({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-league-spartan-bold',
  display: 'swap',
})

export const leagueSpartanExtraBold = League_Spartan({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-league-spartan-extrabold',
  display: 'swap',
})

export const leagueSpartanBlack = League_Spartan({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-league-spartan-black',
  display: 'swap',
})