# Available Competitions - Sports Monks Coverage

**Last Updated:** October 2, 2025
**Subscription:** European Plan (Standard) + European Club Tournaments Add-on
**Total Leagues:** 30

---

## 🎯 Currently Implemented (8 Competitions)

These competitions are mapped and ready for automated TV broadcast sync:

| ID | Competition | Sports Monks ID | Sports Monks Name | Status |
|----|------------|-----------------|-------------------|--------|
| 1 | Premier League | 8 | Premier League | ✅ Mapped |
| 2 | Champions League | 2 | Champions League | ✅ Mapped |
| 3 | FA Cup | 24 | FA Cup | ✅ Mapped |
| 4 | EFL Cup | 27 | Carabao Cup | ✅ Mapped |
| 5 | Europa League | 5 | Europa League | ✅ Mapped |
| 6 | Europa Conference League | 2286 | Europa Conference League | ✅ Mapped |
| 7 | Scottish Premiership | 501 | Premiership | ✅ Mapped |
| 8 | Championship | 9 | Championship | ✅ Mapped |

**Not Available:**
- League One (ID 9) - Sports Monks ID: 12 - Not in subscription

---

## 🌍 Available But Not Yet Implemented

Your Sports Monks subscription includes **22 additional competitions** that could be added to the website:

### Major European Leagues

#### 🇩🇪 Germany
- **Bundesliga** (ID: 82)

#### 🇪🇸 Spain
- **La Liga** (ID: 564)
- **La Liga 2** (ID: 567)
- **Copa Del Rey** (ID: 570)

#### 🇮🇹 Italy
- **Serie A** (ID: 384)
- **Serie B** (ID: 387)
- **Coppa Italia** (ID: 390)

#### 🇫🇷 France
- **Ligue 1** (ID: 301)

#### 🇳🇱 Netherlands
- **Eredivisie** (ID: 72)

#### 🇵🇹 Portugal
- **Liga Portugal** (ID: 462)

#### 🇷🇺 Russia
- **Premier League** (ID: 486)

#### 🇹🇷 Turkey
- **Super Lig** (ID: 600)

#### 🇺🇦 Ukraine
- **Premier League** (ID: 609)

### Smaller European Leagues

#### 🇦🇹 Austria
- **Admiral Bundesliga** (ID: 181)

#### 🇧🇪 Belgium
- **Pro League** (ID: 208)

#### 🇭🇷 Croatia
- **1. HNL** (ID: 244)

#### 🇩🇰 Denmark
- **Superliga** (ID: 271)

#### 🇳🇴 Norway
- **Eliteserien** (ID: 444)

#### 🇵🇱 Poland
- **Ekstraklasa** (ID: 453)

#### 🇸🇪 Sweden
- **Allsvenskan** (ID: 573)

#### 🇨🇭 Switzerland
- **Super League** (ID: 591)

### European Competition Add-ons

#### Additional UEFA Tournaments
- **UEFA Europa League Play-offs** (ID: 1371)

---

## 📊 Coverage Summary

### Current Website Coverage
- **Implemented:** 8 competitions
- **Available to add:** 22 competitions
- **Total accessible:** 30 competitions

### Geographic Coverage

| Region | Implemented | Available | Total |
|--------|------------|-----------|-------|
| England | 3 (PL, Championship, FA Cup, Carabao) | 0 | 3 |
| Scotland | 1 (Premiership) | 0 | 1 |
| European Cups | 3 (UCL, UEL, UECL) | 1 (Play-offs) | 4 |
| Germany | 0 | 1 (Bundesliga) | 1 |
| Spain | 0 | 3 (La Liga, La Liga 2, Copa) | 3 |
| Italy | 0 | 3 (Serie A, Serie B, Coppa) | 3 |
| France | 0 | 1 (Ligue 1) | 1 |
| Netherlands | 0 | 1 (Eredivisie) | 1 |
| Portugal | 0 | 1 (Liga Portugal) | 1 |
| Other Europe | 0 | 11 leagues | 11 |

---

## 🚀 Expansion Opportunities

### High Priority (Top European Leagues)
1. **Bundesliga** (Germany) - Major league, high interest
2. **La Liga** (Spain) - Major league, high interest
3. **Serie A** (Italy) - Major league, high interest
4. **Ligue 1** (France) - Major league, PSG etc.

### Medium Priority (Secondary Leagues)
5. **Eredivisie** (Netherlands) - Good quality, Ajax etc.
6. **Liga Portugal** (Portugal) - Champions League teams
7. **Super Lig** (Turkey) - Growing interest

### Low Priority (Smaller Markets)
8. Regional leagues (Austria, Belgium, Croatia, etc.)
9. Second divisions (La Liga 2, Serie B)
10. Lower-tier European competitions

---

## 💡 Implementation Notes

### To Add a New Competition:

1. **Add to database** `competitions` table
2. **Map in config** - Add to `src/config/sportmonks-mappings.json`
3. **Update migration** - Add to `database/migrations/sportmonks-league-mapping.sql`
4. **Create route** - Add to `src/App.tsx` (e.g., `/competitions/bundesliga`)
5. **Test sync** - Verify TV broadcast data syncs correctly

### Data Available for Each Competition:
- ✅ Fixtures & schedules
- ✅ TV broadcast information (59+ stations per match)
- ✅ Live scores
- ✅ Team lineups
- ✅ Match statistics
- ✅ Venue information
- ✅ Head-to-head data

### Limitations:
- No access to League One (would need different subscription)
- No access to lower English divisions (League Two, National League)
- Focus is on European leagues, limited global coverage

---

## 📈 SEO Potential

Each new competition could add:
- **Fixtures pages:** `/competitions/{slug}`
- **Team pages:** `/clubs/{team-slug}` (all teams in competition)
- **Matchweek pages:** `/competitions/{slug}/matchweek/{number}`
- **H2H pages:** `/h2h/{team1}-vs-{team2}`
- **TV guide pages:** `/how-to-watch/{competition}`

**Estimated new pages per competition:**
- 20 teams × 1 team page = 20 pages
- 38 matchweeks × 1 page = 38 pages
- 190 H2H combinations = 190 pages
- **Total: ~250 new SEO pages per competition**

**With 22 available competitions:**
- Potential: **5,500+ new indexable pages**
- Massive SEO opportunity for European football coverage

---

## 🔄 Update Process

When Sports Monks subscription changes:
1. Run `node scripts/list-all-sportmonks-leagues.mjs` to see all accessible leagues
2. Update this document with new/removed leagues
3. Update `sportmonks-mappings.json` if needed
4. Re-run sync scripts to verify data access

---

**Next Steps:**
- Prioritize which competitions to add based on user demand
- Consider user polls or analytics to guide expansion
- Ensure infrastructure can handle 30 competitions before full rollout
