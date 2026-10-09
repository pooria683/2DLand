export const categories = ['همه', 'ماجراجویی', 'پازل', 'کلاسیک', 'خلاقانه']

export const games = [
  {
    id: 'behesht',
    title: 'بهشت',
    description: 'بازی ماجراجویی فارسی با مراحل متنوع',
    emoji: '🌴',
    category: 'ماجراجویی',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    file: '/games/behesht/index.html',
    featured: true,
  },
]

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem('recent-games')) || []
  } catch {
    return []
  }
}

export function saveRecent(id) {
  const list = getRecent().filter((x) => x !== id)
  list.unshift(id)
  localStorage.setItem('recent-games', JSON.stringify(list.slice(0, 6)))
}
