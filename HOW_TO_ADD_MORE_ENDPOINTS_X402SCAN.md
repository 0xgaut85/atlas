# Comment Ajouter Plus d'Endpoints sur x402scan

Maintenant que `https://api.atlas402.com/api/atlas-index` est enregistré avec succès, voici comment ajouter d'autres endpoints.

## Endpoints Disponibles à Enregistrer

### 1. Atlas Operator
**URL:** `https://api.atlas402.com/api/chat`  
**Description:** Autonomous AI operator with x402 access  
**Prix:** $1.00 USDC  
**Réponse:** Base-only (configuré)

### 2. Atlas Foundry (Token Creation)
**URL:** `https://api.atlas402.com/api/token/create`  
**Description:** Create and deploy x402-protected tokens  
**Prix:** $10.00 USDC  
**Réponse:** Base-only (configuré)  
**Note:** C'est un endpoint POST, x402scan peut ne pas le supporter directement

## Processus d'Enregistrement

### Sur x402scan.com

1. Va sur https://www.x402scan.com/resources/register

2. Pour chaque endpoint :
   - **Resource URL:** L'URL complète de l'endpoint (ex: `https://api.atlas402.com/api/chat`)
   - **Headers:** Laisse vide (pas de headers personnalisés)
   - **Validation Schema:** Laisse vide (optionnel)

3. Clique sur "Add Resource"

4. x402scan va :
   - Valider que l'endpoint retourne HTTP 402
   - Vérifier le schéma x402 strict
   - Vérifier les headers CORS
   - Vérifier le certificat SSL

## Vérification Avant Enregistrement

Pour chaque endpoint, vérifie qu'il retourne bien Base-only :

```bash
curl https://api.atlas402.com/api/chat
curl https://api.atlas402.com/api/token/create
```

Tu devrais voir :
- HTTP 402
- Un seul élément dans `accepts` avec `network: "base"`
- Pas de champ `error`
- Schéma conforme

## Endpoints Déjà Configurés (Base-only)

Tous ces endpoints retournent maintenant Base-only pour x402scan :
- ✅ `/api/atlas-index` - Enregistré avec succès
- ✅ `/api/chat` (Atlas Operator) - Prêt à enregistrer
- ✅ `/api/token/create` - Prêt à enregistrer (POST, peut nécessiter vérification)

## Endpoints Dynamiques (Tokens)

Les endpoints de mint de tokens sont dynamiques :
- `/api/token/[contractAddress]/mint`
- Ceux-ci sont créés automatiquement quand un token est déployé
- Ils ne peuvent pas être enregistrés manuellement car ils sont dynamiques

## Découverte Automatique

Alternative à l'enregistrement manuel :

1. Fais un premier paiement réel sur chaque endpoint
2. PayAI facilitator enregistrera automatiquement tes endpoints
3. x402scan synchronisera toutes les ~15 minutes
4. Tes endpoints apparaîtront automatiquement

**Avantage:** Plus simple, mais peut prendre 15 minutes après le premier paiement.

## Notes Importantes

- **Base-only:** Tous les endpoints retournent maintenant Base uniquement pour simplifier l'enregistrement
- **POST endpoints:** Les endpoints POST (comme `/api/token/create`) peuvent ne pas être supportés par x402scan pour l'invocation directe, mais peuvent être listés
- **Endpoints dynamiques:** Les endpoints de mint (`/api/token/[address]/mint`) sont créés dynamiquement et ne peuvent pas être enregistrés manuellement

## Prochaines Étapes

1. Enregistre `/api/chat` (Atlas Operator) sur x402scan
2. Teste `/api/token/create` (peut nécessiter vérification car c'est POST)
3. Fais des paiements réels pour déclencher la découverte automatique

