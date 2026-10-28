import { useState } from 'react'
import './App.css'

const articles = [
  {
    id: 1,
    category: 'Технологии',
    date: '25 октомври 2026',
    title: 'Как технологиите променят ежедневието ни',
    excerpt: 'Открий новите тенденции, които променят начина, по който работим, учим и общуваме.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    read: '5 мин четене',
  },
  {
    id: 2,
    category: 'Бизнес',
    date: '22 октомври 2026',
    title: 'Първите стъпки към собствен онлайн бизнес',
    excerpt: 'Практични идеи за изграждане на онлайн присъствие и развитие на собствен проект.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    read: '7 мин четене',
  },
  {
    id: 3,
    category: 'Начин на живот',
    date: '19 октомври 2026',
    title: 'Малките навици с голямо значение',
    excerpt: 'Как ежедневните решения могат да помогнат за по-балансиран и организиран живот.',
    image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=900&q=80',
    read: '4 мин четене',
  },
  {
    id: 4,
    category: 'Образование',
    date: '16 октомври 2026',
    title: 'Как да учим по-ефективно в дигиталната ера',
    excerpt: 'Полезни подходи за усвояване на знания и използване на дигиталните инструменти.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=900&q=80',
    read: '6 мин четене',
  },
  {
    id: 5,
    category: 'Технологии',
    date: '12 октомври 2026',
    title: 'Изкуственият интелект и бъдещето',
    excerpt: 'Възможностите на новите инструменти и начините, по които можем да ги използваме.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
    read: '8 мин четене',
  },
  {
    id: 6,
    category: 'Бизнес',
    date: '8 октомври 2026',
    title: 'Създай своята следваща голяма идея',
    excerpt: 'От първоначалната идея до ясен план за действие и устойчиво развитие.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    read: '5 мин четене',
  },
]

const categories = ['Всички', 'Технологии', 'Бизнес', 'Начин на живот', 'Образование']

function App() {
  const [activeCategory, setActiveCategory] = useState('Всички')
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = activeCategory === 'Всички' || article.category === activeCategory
    const term = search.toLowerCase().trim()
    const matchesSearch =
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.category.toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="site">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setSelectedArticle(null)}>
          <span className="brand-mark">Б</span>
          <span>БЛОГ<span className="brand-light">ПОСТ</span></span>
        </a>
        <nav className="main-nav">
          <a href="#articles" onClick={() => setSelectedArticle(null)}>Статии</a>
          <a href="#categories" onClick={() => setSelectedArticle(null)}>Категории</a>
          <a href="#about" onClick={() => setSelectedArticle(null)}>За нас</a>
        </nav>
        <a className="nav-button" href="#articles" onClick={() => setSelectedArticle(null)}>Разгледай статиите ↗</a>
      </header>

      {selectedArticle ? (
        <main className="article-page">
          <button className="back-button" onClick={() => setSelectedArticle(null)}>← Всички статии</button>
          <img className="article-cover" src={selectedArticle.image} alt="" />
          <div className="article-body">
            <span className="category-label">{selectedArticle.category}</span>
            <p className="article-date">{selectedArticle.date} · {selectedArticle.read}</p>
            <h1>{selectedArticle.title}</h1>
            <p className="article-lead">{selectedArticle.excerpt}</p>
            <p>Добре дошли в нашата статия! Тук ще откриете полезни идеи, практични насоки и вдъхновение, които можете да приложите в ежедневието си.</p>
            <p>В свят, който се променя непрекъснато, е важно да бъдем любопитни, да търсим нова информация и да споделяме знанията си с другите.</p>
            <p>Следете блога за още материали, нови гледни точки и полезно съдържание по темите, които ви интересуват.</p>
          </div>
        </main>
      ) : (
        <>
          <section className="hero">
            <div className="hero-content">
              <span className="eyebrow"><span className="eyebrow-dot"></span> ИДЕИ, ЗНАНИЯ И ВДЪХНОВЕНИЕ</span>
              <h1>Истории, които<br /><span>си заслужава</span> да прочетеш.</h1>
              <p>Откривай нови идеи, полезни съвети и различни гледни точки. Твоето място за любопитни умове.</p>
              <a className="hero-button" href="#articles">Открий следващото си четиво <span>↗</span></a>
              <div className="hero-stats">
                <div><strong>6+</strong><span>Примерни статии</span></div>
                <div><strong>4</strong><span>Категории</span></div>
                <div><strong>∞</strong><span>Нови идеи</span></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-wrap">
                <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85" alt="Работно място за писане" />
              </div>
              <div className="floating-card"><span className="floating-icon">✳</span><div><strong>Вдъхновение всеки ден</strong><span>Намери своята следваща идея.</span></div></div>
              <div className="hero-orbit orbit-one"></div>
              <div className="hero-orbit orbit-two"></div>
            </div>
          </section>

          <section className="category-section" id="categories">
            <div className="section-heading">
              <div><span className="section-kicker">ИЗБЕРИ СВОЯТА ТЕМА</span><h2>Какво те интересува?</h2></div>
              <span className="section-note">Разгледай съдържанието по категории</span>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <button key={category} className={`category-chip ${activeCategory === category ? 'active' : ''}`} onClick={() => { setActiveCategory(category); setSelectedArticle(null) }}>
                  {category === 'Всички' ? '✳' : '↗'} {category}
                </button>
              ))}
            </div>
          </section>

          <section className="articles-section" id="articles">
            <div className="section-heading articles-heading">
              <div><span className="section-kicker">ПОСЛЕДНО ОТ БЛОГА</span><h2>Истории и идеи</h2></div>
              <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Търси статия..." aria-label="Търси статия" /></label>
            </div>
            <div className="article-grid">
              {filteredArticles.map((article, index) => (
                <article className="article-card" key={article.id}>
                  <button className="article-image-button" onClick={() => setSelectedArticle(article)} aria-label={`Прочети ${article.title}`}>
                    <img src={article.image} alt="" loading="lazy" />
                    <span className="image-arrow">↗</span>
                  </button>
                  <div className="article-card-content">
                    <div className="article-meta"><span className="category-label">{article.category}</span><span>{article.read}</span></div>
                    <button className="article-title-button" onClick={() => setSelectedArticle(article)}>{article.title}</button>
                    <p>{article.excerpt}</p>
                    <button className="read-more" onClick={() => setSelectedArticle(article)}>Прочети статията <span>→</span></button>
                  </div>
                </article>
              ))}
            </div>
            {filteredArticles.length === 0 && <div className="empty-state">Няма намерени статии. Опитай с друга дума или категория.</div>}
          </section>
        </>
      )}

      <section className="about-section" id="about">
        <span className="section-kicker">НАШАТА ИДЕЯ</span>
        <h2>Любопитството води напред.</h2>
        <p>Създаваме пространство за идеи, знания и истории, които вдъхновяват.</p>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#" onClick={() => setSelectedArticle(null)}><span className="brand-mark">Б</span><span>БЛОГ<span className="brand-light">ПОСТ</span></span></a>
        <span>© 2026 БлогПост. Създадено с любопитство.</span>
        <a href="#articles" onClick={() => setSelectedArticle(null)}>Към статиите ↑</a>
      </footer>
    </div>
  )
}

export default App