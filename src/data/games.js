// 📋 لیست بازی‌ها
// برای اضافه کردن بازی جدید:
//   ۱) پوشه بازی رو بذار توی public/games/نام-بازی/
//   ۲) یک بلوک مثل بلوک پایین به این لیست اضافه کن
//   ۳) ratio رو با سایز اصلی بازی تنظیم کن: [عرض, ارتفاع]
// همینه! بقیه‌ی سایت خودکار آپدیت می‌شه.

export const categories = ['همه', 'ماجراجویی', 'پازل', 'کلاسیک', 'خلاقانه']

export const games = [
  {
    id: 'behesht',
    title: 'بهشت',
    description: 'بازی ماجراجویی فارسی با ۶۹ سالن',
    emoji: '🌴',
    category: 'ماجراجویی',
    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
    file: '/games/behesht/index.html',
    featured: true,
    ratio: [16, 9],        // 🆕 سایز اصلی بازی: ۹۶۰×۵۴۰
  },
]

// ---- سیستم «اخیراً بازی شده» (تغییر نده) ----

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
