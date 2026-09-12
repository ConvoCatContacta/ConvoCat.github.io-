# Convocat

Radar de convocatòries d'ajuts i subvencions **obertes** a Catalunya, en català i explicades en
llenguatge planer.

→ **https://convocatcontacta.github.io/ConvoCat.github.io-/**

Convocat és un projecte independent. **No és un web oficial** i no té cap vincle amb cap
administració pública. Cada fitxa enllaça sempre a la convocatòria oficial, i els resums són
orientatius: el que val són les bases reguladores.

## Com funciona

```
Ingesta diària (GitHub Actions, 04:00 UTC)
  ├── BDNS      òrgans de Catalunya → llistat → detall
  ├── RAISC     dades obertes de la Generalitat
  ├── normalitza, creua territori i dedupa  → data/convocatories.json
  ├── resum en català planer (Claude Haiku) → data/summaries/
  ├── commit de les dades a main
  └── crida el flux de publicació → Astro → GitHub Pages
```

Les dades viuen al repo a propòsit: donen historial auditable i el diff contra el commit
anterior és el que detecta les novetats per al butlletí.

## Desenvolupament

```bash
npm ci
npm run ingest     # ~25 min: 11.600 peticions de detall a BDNS a ritme educat
npm run dev        # http://localhost:4321/ConvoCat.github.io-/
```

| Ordre | Què fa |
|---|---|
| `npm run ingest` | Refresca `data/` des de BDNS i RAISC |
| `npm run butlleti` | Prepara un esborrany de butlletí amb les novetats |
| `npm test` | Tests unitaris |
| `npm run typecheck` | Comprovació de tipus |
| `npm run build` | Genera el lloc a `dist/` |

El lloc es publica sota una subruta, així que **cap plantilla escriu rutes internes a mà**:
totes passen per `import.meta.env.BASE_URL`. El dia que hi hagi domini propi només cal
exportar `SITE` i `BASE_PATH=/`.

## Secrets (tots opcionals)

| Variable | Si no hi és |
|---|---|
| `ANTHROPIC_API_KEY` | Les fitxes es publiquen sense el paràgraf de resum |
| `BUTTONDOWN_API_KEY` | No es crea l'esborrany del butlletí |
| `PUBLIC_BUTTONDOWN_USER` | No es mostra el formulari d'alta al lloc |
| `PUBLIC_GOATCOUNTER` | No es carrega cap analítica |

## Fonts

- **BDNS** — Base de Dades Nacional de Subvencions. La reutilització està subjecta al seu avís
  legal i la informació és dinàmica: es pot corregir o eliminar a l'origen.
- **RAISC** — Registre d'ajuts i subvencions de Catalunya, via el portal de dades obertes.

Les trampes d'aquestes dues API (filtres que no filtren el que sembla, flags que menteixen,
espais d'identificadors que es solapen) estan documentades als comentaris de `pipeline/`.
