# Medicine Store Dashboard

React + Vite ile gelistirilmis eczane yonetim paneli projesi. Dashboard, siparis, urun, tedarikci ve musteri ekranlarini; kimlik dogrulama akisini ve form tabanli CRUD islemlerini icerir.

## Ozellikler

- `react-router-dom` ile private/public rota yapisi
- `react-hook-form` + `yup` ile login ve modal formlarinda dogrulama
- Firebase Auth/Firestore entegrasyonu (env tanimliysa aktif)
- Firebase ayari yoksa asenkron local mock fallback
- Sidebar menu, aktif rota vurgusu, Header ve Logout akisi
- Dashboard istatistik, recent customers, income/expense tablolari
- Orders, Products, Suppliers, Customers sayfalarinda filtreleme
- Products/Suppliers icin ekleme-duzenleme modallari ve urun silme islemi
- Customers tablosunda pagination
- Icon sprite kullanimi (`public/icons.svg`)
- Favicon ve Google Fonts baglantisi
- Responsive kirilma noktalari: `375px`, `768px`, `1440px`

## Teknolojiler

- React 19
- Vite
- Firebase
- React Hook Form
- Yup
- Uzun metinler: `EllipsisCell` (CSS `text-overflow: ellipsis`)

## Kurulum

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Firebase Yapilandirma

`.env` dosyasina su degerleri ekleyin:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Bu degerler doluysa uygulama Firebase Auth + Firestore ile calisir. Bos birakilirsa demo/mock mod devreye girer.

Demo login (mock mod):

- Email: `vendor@gmail.com`
- Sifre: `Admin123!`

## Build ve Deploy

```bash
npm run build
npm run preview
```

Deploy icin GitHub Pages, Netlify veya Vercel kullanilabilir.

Render uzerinde deploy ederken Web Service ayarlari:

- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Port: Render otomatik `PORT` env verir; Vite config bunu otomatik kullanir.

## Tasarim ve Teknik Gorev

- Tasarim: Figma/teknik gorev baglantisi (eklenecek)
- Teknik dokuman: Proje gorev metni (eklenecek)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and `[typescript-eslint](https://typescript-eslint.io)` in your project.