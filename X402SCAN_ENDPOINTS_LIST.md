# Liste des Endpoints à Enregistrer sur x402scan

## Endpoints Disponibles

### ✅ 1. Atlas Index (DÉJÀ ENREGISTRÉ)
**URL:** `https://api.atlas402.com/api/atlas-index`  
**Method:** GET  
**Prix:** $1.00 USDC  
**Status:** ✅ Enregistré avec succès  
**Description:** "Discover and test x402 services across categories"

---

### 2. Atlas Operator  
**URL:** `https://api.atlas402.com/api/chat`  
**Method:** POST (peut nécessiter vérification)  
**Prix:** $1.00 USDC  
**Description:** "Autonomous AI operator with x402 access"  
**Note:** C'est un endpoint POST, x402scan peut avoir des limitations pour les POST. Teste d'abord avec GET sur `/api/atlas-operator` si disponible.

**Alternative:** `https://api.atlas402.com/api/atlas-operator` (GET endpoint séparé)

---

### 3. Atlas Foundry (Token Creation)
**URL:** `https://api.atlas402.com/api/token/create`  
**Method:** POST  
**Prix:** $10.00 USDC  
**Description:** "Create and deploy x402-protected tokens"  
**Note:** POST endpoint - x402scan peut ne pas permettre l'invocation directe mais peut lister la ressource.

---

### 4. Atlas Mesh (Service Registration)
**URL:** `https://api.atlas402.com/api/mesh/register`  
**Method:** POST (probablement)  
**Prix:** $50.00 USDC  
**Description:** "Register x402 services for discovery"  
**Note:** POST endpoint - vérifie d'abord si disponible.

---

## Instructions pour Enregistrement

### Sur https://www.x402scan.com/resources/register :

**Pour chaque endpoint :**

1. **Resource URL:** Copie l'URL complète de l'endpoint
2. **Headers:** Laisse vide
3. **Validation Schema:** Laisse vide
4. Clique sur "Add Resource"

### Ordre Recommandé :

1. ✅ `/api/atlas-index` - **DÉJÀ ENREGISTRÉ**
2. `/api/atlas-operator` - Ensuite
3. `/api/token/create` - Teste (POST peut ne pas fonctionner)
4. `/api/mesh/register` - Teste (POST peut ne pas fonctionner)

---

## Vérification Avant Enregistrement

### Teste chaque endpoint :

```bash
# Atlas Operator (GET)
curl https://api.atlas402.com/api/atlas-operator

# Atlas Index (GET) - déjà testé ✅
curl https://api.atlas402.com/api/atlas-index

# Token Create (POST - peut ne pas retourner 402)
curl -X POST https://api.atlas402.com/api/token/create

# Mesh Register (POST - peut ne pas retourner 402)
curl -X POST https://api.atlas402.com/api/mesh/register
```

Tu devrais voir HTTP 402 avec le schéma x402 pour les GET endpoints.

---

## Notes Importantes

- **GET endpoints:** Fonctionnent mieux avec x402scan (retournent directement 402)
- **POST endpoints:** x402scan peut les lister mais pas les invoquer directement depuis l'interface
- **Base-only:** Tous les endpoints retournent maintenant Base uniquement pour simplification
- **Découverte automatique:** Après un paiement réel, ils apparaîtront automatiquement via le facilitator

---

## URLs Complètes à Copier-Coller

```
https://api.atlas402.com/api/atlas-index
https://api.atlas402.com/api/atlas-operator
https://api.atlas402.com/api/token/create
https://api.atlas402.com/api/mesh/register
```

