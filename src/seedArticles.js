
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const articles = [
  {
    id: 'sample-1',
    category: 'Технологии',
    date: '25 октомври 2026',
    title: 'Как технологиите променят ежедневието ни',
    excerpt: 'Открий новите тенденции, които променят начина, по който работим, учим и общуваме.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    read: '5 мин четене',
    content: 'В свят, който се променя непрекъснато, технологиите влияят на начина, по който работим, учим и общуваме. Следете блога за още полезни идеи.'
  },
  {
    id: 'sample-2',
    category: 'Бизнес',
    date: '22 октомври 2026',
    title: 'Първите стъпки към собствен онлайн бизнес',
    excerpt: 'Практични идеи за изграждане на онлайн присъствие и развитие на собствен проект.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    read: '7 мин четене',
    content: 'Успешният онлайн бизнес започва с ясна идея, познаване на аудиторията и последователен план за развитие.'
  },
  {
    id: 'sample-3',
    category: 'Начин на живот',
    date: '19 октомври 2026',
    title: 'Малките навици с голямо значение',
    excerpt: 'Как ежедневните решения могат да помогнат за по-балансиран и организиран живот.',
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=900&q=80',
    read: '4 мин четене',
    content: 'Малките, постоянни стъпки често водят до голяма промяна. Започни с навици, които можеш да поддържаш всеки ден.'
  },
  {
    id: 'sample-4',
    category: 'Образование',
    date: '16 октомври 2026',
    title: 'Как да учим по-ефективно в дигиталната ера',
    excerpt: 'Полезни подходи за усвояване на знания и използване на дигиталните инструменти.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
    read: '6 мин четене',
    content: 'Поставяй си ясни цели, разделяй материала на малки части и прави редовни повторения, за да учиш по-ефективно.'
  },
  {
    id: 'sample-5',
    category: 'Технологии',
    date: '12 октомври 2026',
    title: 'Изкуственият интелект и бъдещето',
    excerpt: 'Възможностите на новите инструменти и начините, по които можем да ги използваме.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    read: '8 мин четене',
    content: 'Изкуственият интелект предлага нови начини за работа и творчество. Важно е да използваме тези инструменти отговорно.'
  },
  {
    id: 'sample-6',
    category: 'Бизнес',
    date: '8 октомври 2026',
    title: 'Създай своята следваща голяма идея',
    excerpt: 'От първоначалната идея до ясен план за действие и устойчиво развитие.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    read: '5 мин четене',
    content: 'Запиши идеята си, определи следващите три действия и започни с малка проверима стъпка.'
  }
]

export async function seedArticles() {
  for (const article of articles) {
    const articleRef = doc(collection(db, 'articles'), article.id)
    const existing = await getDoc(articleRef)

    if (!existing.exists()) {
      await setDoc(articleRef, {
        ...article,
        published: true,
        createdAt: new Date().toISOString()
      })
    }
  }
}
