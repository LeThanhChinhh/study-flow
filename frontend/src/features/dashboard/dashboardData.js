

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return { word: 'Good morning',  icon: 'sun'  }
  if (h < 17) return { word: 'Good afternoon', icon: 'sun'  }
  return            { word: 'Good evening',   icon: 'moon' }
}

export const TODAY_STR = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export const MODULE_COLORS = {
  violet:  { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' },
  amber:   { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700'   },
  emerald: { bar: 'bg-emerald-500',badge: 'bg-emerald-100 text-emerald-700' },
}


