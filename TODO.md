# TODO: Enable Stock Manager Dashboard Access

## Plan Implementation Steps

### 1. Update Backend Models ✅ **DONE**
- [x] Edit `backend/accounts/models.py`: Add role-to-pages mapping in `CustomUser.save()`
  - For `responsable_stock`: Set `authorized_pages = ['dashboard', 'alertes', 'notifications', 'stock', 'categories', 'stock-movements', 'fournisseurs', 'entrepots', 'facturation', 'history', 'profile', 'settings', 'deconnexion']`

### 2. Update Frontend AuthContext ✅ **DONE**
- [x] Edit `frontend/src/context/AuthContext.jsx`: Include `authorized_pages` in `fetchUserProfile()` and all user data mappings (4 locations)

### 3. Update Frontend Sidebar/Menu ✅ [PENDING]
- [ ] Read/Locate `frontend/src/components/SharedSidebar.jsx` or dashboard menu component
- [ ] Implement menu visibility using `user.authorized_pages.includes(pageSlug)`

### 4. Database Migration & Data Population
- [ ] `cd backend && python manage.py makemigrations accounts`
- [ ] Create migration to populate `authorized_pages` for existing `responsable_stock` users
- [ ] `python manage.py migrate`

### 5. Testing
- [ ] Create/test user: `role='responsable_stock'`
- [ ] Frontend: `cd frontend && npm start`
- [ ] Login → Verify dashboard/menu shows: alerts, notifications, stock, categories, mouvement, fournisseurs, entrepots, facturation, profile, historique
- [ ] Backend test: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/user/ | jq .authorized_pages`

### 6. Completion
- [ ] Update this TODO.md with progress
- [ ] attempt_completion

**Status: Ready to implement step-by-step**

