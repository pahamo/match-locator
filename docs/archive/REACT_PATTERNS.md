# React Patterns & Common Pitfalls

## ❌ Anti-Pattern: Derived State Without Dependencies

**NEVER do this:**
```javascript
const [teams, setTeams] = useState([]);
const stats = calculateStats(teams); // ❌ Calculated once at mount, never updates

useEffect(() => {
  loadTeams().then(setTeams); // teams update, but stats don't!
}, []);
```

**Problem:** `stats` is calculated once when component mounts (with empty `teams`), and never recalculates when `teams` loads from API.

## ✅ Correct Pattern: useMemo for Derived State

```javascript
const [teams, setTeams] = useState([]);
const stats = useMemo(() => calculateStats(teams), [teams]); // ✅ Recalculates when teams change

useEffect(() => {
  loadTeams().then(setTeams);
}, []);
```

## ✅ Alternative: useEffect for Side Effects

```javascript
const [teams, setTeams] = useState([]);
const [stats, setStats] = useState(null);

useEffect(() => {
  if (teams.length > 0) {
    setStats(calculateStats(teams));
  }
}, [teams]);
```

## 🚨 Red Flags to Watch For:

1. **Calculating derived state outside hooks** without dependencies
2. **Using API data in calculations** that happen at component mount
3. **Stats/counts that don't update** when underlying data changes
4. **"Stale state" bugs** where UI shows old values

## 🔍 Debug Techniques:

1. **Add console.logs** to see when calculations happen
2. **Check React DevTools** to see when state updates
3. **Look for missing dependency arrays** in useMemo/useEffect
4. **Test with empty initial state** to catch timing issues

## 📝 Code Review Checklist:

- [ ] All derived state uses `useMemo()` with proper dependencies
- [ ] No calculations happen outside hooks when using async data
- [ ] All `useEffect` have proper dependency arrays
- [ ] Stats/counts update when underlying data changes

---

**Remember:** In React, if it depends on state, it should be in a hook with dependencies!