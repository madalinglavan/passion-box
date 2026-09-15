# PassionBox

Jocuri în doi, cu un design comun și module JavaScript independente. Nu necesită instalarea de pachete sau un build.

## Pornire

Necesită Node.js 20 sau mai nou.

Pe Windows poți porni prin dublu clic pe `Start-PassionBox.cmd`. Scriptul găsește Node.js din sistem sau runtime-ul local Codex și afișează adresa aplicației. Închide terminalul pentru a opri serverul.

```sh
node scripts/serve.mjs
```

Deschide http://127.0.0.1:4173. Păstrează terminalul deschis pe durata folosirii. Modulele ES necesită un server HTTP: nu deschide `index.html` direct prin dublu clic. Pentru găzduire, publică fișierele pe un server static, păstrând structura directoarelor.

## Structură

```text
assets/
  css/tokens.css       Culori, fonturi, spațiere de bază
  css/base.css         Reset, tipografie, accesibilitate
  css/components.css  Navigare, butoane, dialoguri, scoruri
  brand.svg           Siglă locală
src/
  core/               Salvare, profil, scoruri, sunete, utilitare
  components/         Structura comună și aspectul paginilor de joc
  pages/              Pagina principală: home.js și home.css
games/
  card-game/          index.html, app.js, data.js, style.css, media
  wheel-game/         index.html, app.js, data.js, style.css, media
  xo/                 index.html, app.js, rules.js, data.js, style.css, media
roleplay/             index.html, app.js, data.js, style.css, sounds
images/              Avataruri existente
sounds/              Resurse audio existente
scripts/             Server local și verificarea referințelor
tests/               Teste pentru starea persistentă și reguli
```

## Unde modifici

- Culori și fonturi: `assets/css/tokens.css`.
- Navigarea, lista jocurilor și profilurile: `src/components/shell.js`.
- Datele fiecărui joc: propriul `data.js`; logica nu trebuie editată pentru schimbarea textelor.
- Regulile scorului comun: `src/core/stats.js`.
- Aspectul unui joc: propriul `style.css`. Aspectul comun se modifică în `components.css`.
- Textele Roleplay sunt păstrate din proiectul original în `roleplay/data.js`.

Nu adăuga funcții globale și nu încărca scriptul unei pagini în alta. Importă funcționalitatea comună din `src/core` sau `src/components`.

## Date existente

Cheile `coupleNames`, `avatarHe`, `avatarShe`, `globalStats`, `stats`, `wheelStats` și `xoStats` sunt păstrate. Datele invalide primesc valori implicite. Dacă browserul refuză salvarea, interfața anunță utilizatorul și continuă în memoria paginii.

Stocarea browserului este legată de adresă (protocol, domeniu și port). Folosește aceeași adresă pentru a păstra accesul la date; datele de la `file://` sau de pe alt port nu sunt transferate automat.

Scorurile jocurilor sunt separate de scorul comun. Resetarea unui joc nu șterge progresul comun; revendicarea recompensei comune resetează punctele globale și păstrează istoricul câștigurilor.

## Verificare

```sh
node scripts/check.mjs
node --test tests/state.test.mjs
```

Verifică și în browser: profilul, navigarea, o carte acceptată/refuzată, o rotire completă, o victorie și o remiză XO, cei cinci pași Roleplay, afișarea pe mobil și utilizarea cu tastatura.

## Migrarea din structura veche

`globalstats.js`, `js/menu.js` și stilurile vechi ale meniului au fost înlocuite de modulele din `src` și `assets/css`. Codul vechi este păstrat în copia de siguranță, separat de aplicația activă.

`games/mystery-box` era un prototip neconectat, cu referințe rupte. Recompensa comună funcționează acum în pagina principală; vechiul URL are o pagină de redirecționare.

## Pornire din Windows, fara VS Code

Da dublu clic pe `Start-PassionBox.cmd`. Browserul implicit se deschide automat dupa pornirea serverului. Scriptul verifica Node.js 20+ chiar daca runtime-ul nu se afla in PATH-ul Windows.

Daca PassionBox ruleaza deja din acelasi folder, o noua lansare deschide aplicatia existenta. Nu este pornit un al doilea server. Prima fereastra a serverului trebuie pastrata deschisa.

Daca vezi un mesaj ca portul 4173 este ocupat de alta aplicatie sau de o versiune veche, inchide terminalul vechi in care ai pornit serverul si incearca din nou. Nu este necesar VS Code. Deschiderea directa a `index.html` nu poate incarca modulele JavaScript; foloseste lansatorul.

Teste pentru lansator: `node --test tests/launcher.test.mjs`.
