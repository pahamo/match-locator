# Quick TypeScript Property Reference

## 🚨 CRITICAL: Most Common Property Mistakes

### Kickoff Time
```typescript
// ✅ CORRECT (both types)
fixture.kickoff_utc

// ❌ WRONG
fixture.utc_kickoff
```

### Team Names
```typescript
// ✅ HomePage (SimpleFixture)
fixture.home_team    // string
fixture.away_team    // string

// ✅ FixturesPage (Fixture)  
fixture.home.name    // Team object
fixture.away.name    // Team object
```

### Team Crests
```typescript
// ✅ HomePage (SimpleFixture)
fixture.home_crest   // string | undefined
fixture.away_crest   // string | undefined

// ✅ FixturesPage (Fixture)
fixture.home.crest   // string | null
fixture.away.crest   // string | null
```

## 📝 Quick Check Before Coding
1. Which page? HomePage = `SimpleFixture`, FixturesPage = `Fixture`
2. Time always `kickoff_utc` (never `utc_kickoff`)
3. Teams: Simple = strings, Full = objects
4. Run `npm run build` to verify TypeScript

## 🔍 Quick Search Commands
```bash
# Find type definitions
grep -r "interface.*Fixture" src/types/
grep -r "kickoff" src/types/

# Check property usage
grep -r "kickoff_utc" src/
grep -r "home_team\|away_team" src/
```