import { useEffect, useState } from 'react'
import './App.css'
import { auth, db } from './firebase'
import { seedArticles } from './seedArticles'
import DOMPurify from 'dompurify'
import {
	
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

const categories = ['Всички', 'Технологии', 'Бизнес', 'Начин на живот', 'Образование']
const editableCategories = categories.filter((category) => category !== 'Всички')

const emptyForm = {
  title: '',
  category: 'Технологии',
  excerpt: '',
  content: '',
  image: '',
  read: '5 мин четене',
  date: new Date().toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
}
function renderArticleContent(content) {
  const safeHtml = DOMPurify.sanitize(content || '', {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: safeHtml.replace(
          /(?<!["'=])(https?:\/\/[^\s<]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        )
      }}
    />
  )
}
function getArticleUrl(article) {
  return `/articles/${encodeURIComponent(article.id)}`
}
function App() {
  const [activeCategory, setActiveCategory] = useState('Всички')
  const [search, setSearch] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [articles, setArticles] = useState([])
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, setUser)
    const articlesQuery = query(collection(db, 'articles'), orderBy('date', 'desc'))
    const unsubscribeArticles = onSnapshot(
      articlesQuery,
      (snapshot) => {
        setArticles(snapshot.docs.map((item) => ({ ...item.data(), id: item.id })))
      },
      (err) => {
        console.error(err)
        setError('Не успяхме да заредим статиите. Провери интернет връзката и Firestore Rules.')
      },
    )
    return () => {
      unsubscribeAuth()
      unsubscribeArticles()
    }
  }, [])
  
  useEffect(() => {
  const handlePopState = () => {
    setCurrentPath(window.location.pathname)
  }

  window.addEventListener('popstate', handlePopState)

  return () => {
    window.removeEventListener('popstate', handlePopState)
  }
}, [])

useEffect(() => {
  if (articles.length === 0) return

  const match = currentPath.match(/^\/articles\/([^/]+)$/)

  if (match) {
    const articleId = decodeURIComponent(match[1])
    const article = articles.find((item) => item.id === articleId)
    setSelectedArticle(article || null)
  } else {
    setSelectedArticle(null)
  }
}, [currentPath, articles])


  const isAdmin = Boolean(user)

  const filteredArticles = articles.filter((article) => {
    if (!isAdmin && article.published === false) return false
    const matchesCategory = activeCategory === 'Всички' || article.category === activeCategory
    const term = search.toLowerCase().trim()
    const matchesSearch =
      (article.title || '').toLowerCase().includes(term) ||
      (article.excerpt || '').toLowerCase().includes(term) ||
      (article.category || '').toLowerCase().includes(term)
    return matchesCategory && matchesSearch
  })
function openArticle(article) {
  window.history.pushState({}, '', getArticleUrl(article))
  setCurrentPath(window.location.pathname)
  setSelectedArticle(article)
  window.scrollTo(0, 0)
}
  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setShowLogin(false)
      setShowAdmin(true)
      setNotice('Влезе успешно като администратор.')
      setPassword('')
    } catch (err) {
      console.error(err)
      setError('Входът е неуспешен. Провери имейла и паролата си.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSeed() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await seedArticles()
      setNotice('Проверихме примерните статии. Добавени са само тези, които липсваха.')
    } catch (err) {
      console.error(err)
      setError('Не успяхме да добавим примерните статии. Провери дали UID на администратора е правилен във Firestore Rules.')
    } finally {
      setBusy(false)
    }
  }

  function startNewArticle() {
    setEditingId(null)
    setForm({ ...emptyForm, date: new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' }) })
    setNotice('')
    setError('')
  }

  function startEdit(article) {
    setEditingId(article.id)
    setForm({
      title: article.title || '',
      category: article.category || 'Технологии',
      excerpt: article.excerpt || '',
      content: article.content || '',
      image: article.image || '',
      read: article.read || '5 мин четене',
      date: article.date || '',
    })
    setNotice('')
    setError('')
  }

  async function saveArticle(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const articleId = editingId || `article-${Date.now()}`
      const articleData = {
        ...form,
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        image: form.image.trim(),
        published: true,
        updatedAt: new Date().toISOString(),
      }
      if (!articleData.title || !articleData.excerpt) {
        setError('Попълни заглавието и краткото описание.')
        return
      }
      if (editingId) {
        await updateDoc(doc(db, 'articles', articleId), articleData)
      } else {
        await setDoc(doc(db, 'articles', articleId), {
          ...articleData,
          createdAt: new Date().toISOString(),
        })
      }
      setNotice(editingId ? 'Статията е обновена.' : 'Статията е публикувана успешно.')
      startNewArticle()
    } catch (err) {
      console.error(err)
      setError('Записът не беше успешен. Провери дали си влязъл с администратора, чийто UID е във Firestore Rules.')
    } finally {
      setBusy(false)
    }
  }

  async function removeArticle(article) {
    if (!window.confirm(`Сигурен ли си, че искаш да изтриеш „${article.title}“?`)) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await deleteDoc(doc(db, 'articles', article.id))
      if (selectedArticle?.id === article.id) setSelectedArticle(null)
      if (editingId === article.id) startNewArticle()
      setNotice('Статията е изтрита.')
    } catch (err) {
      console.error(err)
      setError('Изтриването не беше успешно. Провери администраторските права.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="site">
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setSelectedArticle(null); setShowAdmin(false) }}>
          <span className="brand-mark">Б</span>
          <span>ТОП<span className="brand-light">СТАТИИ</span></span>
        </a>
        <nav className="main-nav">
          <a href="#articles" onClick={() => { setSelectedArticle(null); setShowAdmin(false) }}>Статии</a>
          <a href="#categories" onClick={() => { setSelectedArticle(null); setShowAdmin(false) }}>Категории</a>
          <a href="#about" onClick={() => { setSelectedArticle(null); setShowAdmin(false) }}>За нас</a>
        </nav>
        {isAdmin ? (
          <button className="nav-button" onClick={() => setShowAdmin((value) => !value)}>
            {showAdmin ? 'Към сайта ↗' : 'Администратор ↗'}
          </button>
        ) : (
          <button className="nav-button" onClick={() => { setShowLogin(true); setError('') }}>Вход за администратор ↗</button>
        )}
      </header>

      {showLogin && !isAdmin && (
        <section className="admin-panel">
          <div className="section-heading">
            <div><span className="section-kicker">АДМИНИСТРАТОР</span><h2>Вход в системата</h2></div>
            <button className="back-button" onClick={() => setShowLogin(false)}>Затвори ✕</button>
          </div>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>Имейл<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Парола<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            <button className="hero-button" type="submit" disabled={busy}>{busy ? 'Моля, изчакай…' : 'Вход'}</button>
          </form>
          {error && <p className="admin-message error-message">{error}</p>}
        </section>
      )}

      {showAdmin && isAdmin ? (
        <main className="admin-panel">
          <div className="section-heading">
            <div><span className="section-kicker">УПРАВЛЕНИЕ НА САЙТА</span><h2>Администраторски панел</h2></div>
            <button className="back-button" onClick={async () => { await signOut(auth); setShowAdmin(false); setNotice('Излезе от профила си.') }}>Изход</button>
          </div>
          <p>Влезли сте като {user.email}. Новите статии се публикуват веднага.</p>
          {notice && <p className="admin-message">{notice}</p>}
          {error && <p className="admin-message error-message">{error}</p>}
          <div className="admin-actions">
            <button className="hero-button" type="button" onClick={startNewArticle}>＋ Нова статия</button>
            <button className="category-chip" type="button" onClick={handleSeed} disabled={busy}>Добави липсващите примерни статии</button>
          </div>
          <form className="admin-form" onSubmit={saveArticle}>
            <h3>{editingId ? 'Редактиране на статия' : 'Нова статия'}</h3>
            <label>Заглавие<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <label>Категория<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{editableCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
            <label>Кратко описание<textarea rows="3" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} required /></label>
            <label>Пълно съдържание<textarea rows="7" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Напиши текста на статията…" /></label>
            <label>URL адрес на снимката<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://example.com/image.jpg" /></label>
            {form.image && <img className="admin-image-preview" src={form.image} alt="Преглед на снимката" onError={(event) => { event.currentTarget.style.display = 'none' }} onLoad={(event) => { event.currentTarget.style.display = 'block' }} />}
            <div className="admin-form-row">
              <label>Дата<input value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
              <label>Време за четене<input value={form.read} onChange={(event) => setForm({ ...form, read: event.target.value })} /></label>
            </div>
            <div className="admin-actions">
              <button className="hero-button" type="submit" disabled={busy}>{busy ? 'Записване…' : editingId ? 'Запази промените' : 'Публикувай статията'}</button>
              {editingId && <button className="category-chip" type="button" onClick={startNewArticle}>Отказ</button>}
            </div>
          </form>
          <h3>Статии в базата данни ({articles.length})</h3>
          <div className="admin-article-list">
            {articles.map((article) => (
              <div className="admin-article-row" key={article.id}>
                <div><strong>{article.title}</strong><span>{article.category} · {article.date}</span></div>
                <div className="admin-actions">
                  <button className="category-chip" onClick={() => startEdit(article)}>Редактирай</button>
                  <button className="category-chip" onClick={() => removeArticle(article)} disabled={busy}>Изтрий</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : selectedArticle ? (
        <main className="article-page">
          
<button
  className="back-button"
  onClick={() => {
    window.history.pushState({}, '', '/')
    setCurrentPath('/')
    setSelectedArticle(null)
  }}
>
  ← Всички статии
</button>

          {selectedArticle.image && <img className="article-cover" src={selectedArticle.image} alt="" />}
          <div className="article-body">
 <span className="category-label">{selectedArticle.category}</span>
<p className="article-date">{selectedArticle.date} · {selectedArticle.read}</p>
<h1>{selectedArticle.title}</h1>
<p className="article-lead">{selectedArticle.excerpt}</p>
{selectedArticle.content
  ? renderArticleContent(selectedArticle.content)
  : <p>Следете блога за още материали, нови гледни точки и полезно съдържание по темите, които ви интересуват.</p>}

<div className="article-source">
  <strong>Източник:</strong>{" "}
  <a
    href={`https://topstatii.web.app/articles/${encodeURIComponent(selectedArticle.id)}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    Прочети оригинала в ТОП СТАТИИ
  </a>
</div>
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
                <div><strong>{articles.length}+</strong><span>Статии</span></div>
                <div><strong>{editableCategories.length}</strong><span>Категории</span></div>
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
              {filteredArticles.map((article) => (
                <article className="article-card" key={article.id}>
                  <button className="article-image-button" onClick={() => openArticle(article)} aria-label={`Прочети ${article.title}`}>
                    {article.image && <img src={article.image} alt="" loading="lazy" />}
                    <span className="image-arrow">↗</span>
                  </button>
                  <div className="article-card-content">
                    <div className="article-meta"><span className="category-label">{article.category}</span><span>{article.read}</span></div>
                    <button className="article-title-button" onClick={() => openArticle(article)}>{article.title}</button>
                    <p>{article.excerpt}</p>
                    <button className="read-more" onClick={() => openArticle(article)}>Прочети статията <span>→</span></button>
                  </div>
                </article>
              ))}
            </div>
            {filteredArticles.length === 0 && <div className="empty-state">Няма намерени статии. Опитай с друга дума или категория.</div>}
          </section>
        </>
      )}

      {!showAdmin && <section className="about-section" id="about">
        <span className="section-kicker">НАШАТА ИДЕЯ</span>
        <h2>Любопитството води напред.</h2>
        <p>Създаваме пространство за идеи, знания и истории, които вдъхновяват.</p>
      </section>}

      <footer className="footer">
        <a className="brand footer-brand" href="#" onClick={(event) => { event.preventDefault(); setSelectedArticle(null); setShowAdmin(false) }}><span className="brand-mark">Б</span><span>ТОП<span className="brand-light">СТАТИИ</span></span></a>
<span>
  © 2026 ТопСтатии. Създадено с любопитство от{" "}
  <a href="https://w-seo.com">Viseo</a> тийм
  {" · "}
  <a
    href="https://linkbilding.com"
    target="_blank"
    rel="noopener noreferrer"
  >
    линк билдинг от VISEO
  </a>
</span>
        <a href="#articles" onClick={() => { setSelectedArticle(null); setShowAdmin(false) }}>Към статиите ↑</a>
      </footer>
    </div>
  )
}

export default App
