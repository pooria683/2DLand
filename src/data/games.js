// 📋 لیست بازی‌ها
// برای اضافه کردن بازی جدید:
//   ۱) پوشه بازی رو بذار توی public/games/نام-بازی/
//   ۲) یک بلوک مثل بلوک پایین اضافه کن
//   ۳) ratio = ابعاد اصلی بازی [عرض, ارتفاع]
//   ۴) saveFile: false یعنی «فایل سیو دانلود نشه، فقط توی مرورگر ذخیره شه»
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
    ratio: [16, 9],        // ابعاد اصلی بازی: ۱۴۴۰×۸۱۰
    saveFile: false,       // سیو فقط در حافظه‌ی مرورگر — بدون دانلود فایل
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
