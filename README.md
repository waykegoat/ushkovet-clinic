# УшкоВет

Сайт ветеринарной клиники «УшкоВет» в Нижнем Новгороде: публичные страницы,
каталог услуг, форма обращения, карта и закрытая панель управления.

## Стек

- Vue 3.5, Composition API, TypeScript strict;
- Vite 8, Vue Router 4, Pinia с сохранением черновиков;
- `vue-i18n`, собственная CSS-система токенов, Inter Variable;
- Vite SSG для индексируемых публичных страниц;
- Worker API и D1 для контента и заявок;
- Vitest, Vue Test Utils, jsdom, ESLint flat config, Prettier.

## Маршруты

- `/` — главная;
- `/services` — каталог услуг;
- `/contacts` — контакты, форма и карта;
- `/admin` — закрытая панель контента и заявок.

Публичные страницы пререндерятся. Для каждой страницы заданы уникальные
метаданные, canonical URL и Open Graph; главная содержит JSON-LD
`VeterinaryCare`.

## Локальная разработка

Требуется Node.js 22.13 или новее.

```bash
npm install
npm run dev
```

Проверки:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run check
```

## Заявки и контент

Production API сохраняет обращения в таблицу `inquiries`. Они появляются в
разделе «Заявки» панели управления, где администратор меняет их статус. Контент
сайта хранится в таблице `site_content`.

GitHub Pages используется только как статическое клиентское демо: у него нет
серверной среды и базы данных. В demo-сборке форма честно сообщает, что
онлайн-запись будет подключена перед запуском.

Для production фронтенд и API рекомендуется публиковать на одном домене. Если
они размещены отдельно, адрес API задаётся через `VITE_API_BASE_URL`, а на
хостинге настраивается безопасный reverse proxy для `/api`.

## Доступ к панели

Авторизация не зависит от стороннего аккаунта. Backend проверяет email и пароль,
после чего создаёт защищённую `HttpOnly` cookie-сессию.

Переменные окружения:

- `ADMIN_EMAILS` — разрешённые email через запятую;
- `ADMIN_PASSWORD_HASH` — PBKDF2-хеш общего пароля;
- `SESSION_SECRET` — случайный секрет длиной не менее 32 символов;
- `ENVIRONMENT=production`.

Хеш пароля создаётся локально:

```bash
npm run auth:hash -- "длинный-уникальный-пароль"
```

Пароль и секрет сессии нельзя хранить в Git.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` запускает проверки, собирает
статику с base path `/ushkovet-clinic/` и публикует `dist/client`.

```bash
$env:VITE_BASE_PATH="/ushkovet-clinic/"
$env:VITE_STATIC_DEMO="true"
npm run build:pages
```

## Структура

```text
src/
  components/   UI-блоки
  composables/  SEO и диалоги
  content/      типы и стартовый контент
  locales/      переводы
  pages/        публичные страницы и панель
  stores/       контент и локальные черновики
  styles/       токены, базовые и адаптивные стили
worker/         API, сессии и D1
drizzle/        SQL-миграции
tests/          компонентные и API-тесты
```

Контент и фотографии основаны на ранее опубликованных материалах клиники.
Перед production-запуском владелец подтверждает цены, режим работы, состав
специалистов и права на изображения.
