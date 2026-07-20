# Prompt: Execute Localized URL Migration

Copy everything inside the block below into a new Codex session.

```text
Kerjakan migrasi URL localized untuk repository:

/Users/fahmi/Documents/Jurnal Dev/repository

Goal akhirnya: semua public page memakai prefix `/en` atau `/id`, URL menjadi
source of truth locale, dan seluruh URL lama tetap kompatibel melalui redirect
permanen 308 yang deterministik.

Sebelum mengubah kode:

1. Baca dan patuhi `AGENTS.md` serta `CLAUDE.md`.
2. Pastikan pekerjaan dimulai dari HEAD terbaru branch
   `codex/production-hardening` yang sudah memuat production hardening dan
   dokumen migrasi.
3. Baca design spec lengkap:
   `docs/superpowers/specs/2026-07-20-localized-url-migration-design.md`
4. Baca dan eksekusi implementation plan secara berurutan:
   `docs/superpowers/plans/2026-07-20-localized-url-migration.md`
5. Buat/switch ke branch `codex/localized-url-migration` sebelum implementasi.
6. Periksa `git status`; pertahankan semua perubahan milik user. `AGENTS.md`
   saat ini untracked dan tidak boleh diedit, dihapus, atau dimasukkan commit.

Jalankan plan sampai benar-benar selesai, bukan hanya audit atau report. Gunakan
TDD sesuai langkah plan, centang checklist plan selama progres, dan buat commit
kecil pada checkpoint yang sudah ditentukan. Jangan mengulang brainstorming
atau mengganti desain yang sudah approved kecuali menemukan kontradiksi teknis
yang terbukti dari source code atau dokumentasi resmi Next.js 16.

Keputusan desain yang tidak boleh berubah:

- Public routes: `/[locale]`, `/[locale]/jurnal`,
  `/[locale]/jurnal/[slug]`, `/[locale]/portfolio`, dan
  `/[locale]/portfolio/[slug]`.
- Locale valid hanya `en` dan `id`.
- URL adalah source of truth; tidak ada redirect berdasarkan browser language,
  cookie, geolocation, atau `Accept-Language`.
- `/`, `/jurnal`, dan `/portfolio` redirect 308 ke versi `/en`.
- Legacy detail slug di-resolve berdasarkan locale kontennya; collision memilih
  English; unknown slug 404; outage CMS tidak boleh disamarkan sebagai 404.
- Query string legacy redirect wajib dipertahankan.
- Setiap page hanya fetch dan render satu locale.
- Language toggle adalah navigasi URL. Detail memakai real translated slug;
  jika translation tidak ada, target locale disabled dengan accessible label.
- Canonical, hreflang, Open Graph locale, sitemap, share URL, dan `<html lang>`
  harus konsisten dengan URL aktif.
- `/api/articles` dan schema Strapi tidak dimigrasikan ke prefix locale.
- Giscus tetap `mapping="specific"` dan `term={slug}` agar thread lama tidak
  sengaja menjadi orphan.
- Hapus `LocaleGate`, dual-locale fetch/render, browser locale detection, dan
  imperative `setLang` setelah semua consumer selesai dimigrasikan.

Gunakan `apply_patch` untuk edit file. Jangan menjalankan destructive git
commands, jangan menyentuh perubahan di luar scope, jangan push, dan jangan
membuat PR kecuali diminta.

Sebelum menyatakan selesai, wajib jalankan:

pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
git diff --check

Pastikan acceptance tests mencakup raw initial `<html lang>`, semua legacy 308,
query preservation, translated-slug navigation, unavailable translation,
canonical/hreflang/OG locale, localized sitemap alternates, truthful 404/503,
security headers, share URL, dan console/hydration errors.

Di laporan akhir, cantumkan:

- branch dan commit yang dibuat;
- ringkasan perubahan arsitektur;
- hasil numerik unit test dan E2E;
- hasil build;
- bukti URL lama redirect dan URL baru render;
- `git status --short` terakhir serta konfirmasi `AGENTS.md` tetap untouched;
- blocker atau deviasi dari plan, jika ada.
```
