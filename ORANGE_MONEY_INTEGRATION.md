# Guide d'intégration Orange Money - MySchool App

## 📋 Vue d'ensemble

L'intégration Orange Money v2.1.0 permet aux utilisateurs de payer leurs cours via Orange Money Senegal. Le système fonctionne en mode MOCK par défaut (pas besoin de credentials Orange Money).

## 🏗️ Architecture

### Services créés
1. **PaymentService** (`src/app/features/services/paymentService.ts`)
   - 10 méthodes pour gérer les paiements Orange Money
   - Validation des numéros de téléphone sénégalais
   - Formatage des montants (centimes ↔ FCFA)
   - Vérification du statut de paiement

2. **EnrollmentService** (mis à jour)
   - Création d'enrollment avec paiement optionnel
   - Détection automatique du paiement Orange Money
   - Conversion des montants en centimes

### Pages créées/mises à jour
1. **PaymentMethodPage** (mis à jour)
   - Formulaire de saisie pour Orange Money
   - Validation du numéro de téléphone
   - Sauvegarde des données client

2. **PaymentVerifyPage** (mis à jour)
   - Redirection vers Orange Money si paiement créé
   - Sauvegarde de l'état du paiement en attente
   - Gestion des enrollments Premium

3. **PaymentCallbackPage** (nouvelle page)
   - Retour depuis Orange Money
   - Vérification du statut de paiement
   - Redirection vers le cours après succès

## 🔄 Flux de paiement

### Cours individuel

```
1. Utilisateur sélectionne un cours
   └─> CoursDetailPage

2. Utilisateur choisit une formule
   └─> PaymentMethodPage

3. Si Orange Money sélectionné:
   └─> Affichage formulaire téléphone
   └─> Validation: +221 7X XXX XX XX
   └─> Sauvegarde données client (localStorage)

4. Confirmation paiement
   └─> PaymentVerifyPage
   └─> EnrollmentService.createEnrollment()
       ├─> Création enrollment (status: pending)
       └─> Si orange-money + amount > 0:
           └─> PaymentService.createPayment()
               ├─> Conversion montant (FCFA → centimes)
               ├─> Appel API POST /payments
               └─> Retour: { paymentUrl, id, status: PENDING }

5. Redirection Orange Money
   └─> window.location.href = payment.data.paymentUrl
   └─> Sauvegarde: pendingPaymentId, pendingEnrollmentId, pendingCourseId

6. Paiement sur Orange Money
   └─> Utilisateur entre son code PIN
   └─> Orange Money traite le paiement

7. Retour application
   └─> PaymentCallbackPage (/payment-callback)
   └─> PaymentService.checkPaymentStatus(paymentId)
       └─> Appel API GET /payments/:id/check

8. Selon statut:
   ├─> SUCCESS: Redirection vers course-video/:id
   ├─> PENDING: Bouton "Vérifier le statut"
   ├─> FAILED: Bouton "Réessayer"
   ├─> EXPIRED: Bouton "Réessayer"
   └─> CANCELLED: Bouton "Réessayer"
```

## 📱 Validation des numéros de téléphone

### Format accepté
```
+221 7X XXX XX XX

Préfixes valides:
- 70 (Orange)
- 75 (Orange)
- 76 (Orange)
- 77 (Orange)
- 78 (Orange)
```

### Méthodes de validation
```typescript
// Valider un numéro
paymentService.validateSenegalPhone('+221 77 123 45 67') // true

// Formater un numéro
paymentService.formatSenegalPhone('221771234567') // '+221771234567'
paymentService.formatSenegalPhone('77 123 45 67') // '+221771234567'
```

## 💰 Gestion des montants

### Conversion automatique
```typescript
// Frontend (FCFA)
amount: 1999 FCFA

// Backend (centimes)
amount: 199900 centimes

// Conversion dans EnrollmentService
Math.round(paymentData.amount * 100)
```

### Affichage formaté
```typescript
// Convertir centimes → FCFA
paymentService.formatAmount(199900) // "1999 FCFA"
```

## 🕐 Expiration des paiements

### Délai
- **15 minutes** après création
- Statut passe de `PENDING` à `EXPIRED` automatiquement

### Vérification
```typescript
// Vérifier si un paiement est expiré
const expired = await paymentService.isPaymentExpired(paymentId);

if (expired) {
  console.log('Paiement expiré, créer un nouveau paiement');
}
```

## ❌ Annulation des paiements

### Conditions
- Statut = `PENDING`
- Non expiré (< 15 minutes)

### Méthode
```typescript
// Vérifier si peut être annulé
const canCancel = await paymentService.canBeCancelled(paymentId);

if (canCancel) {
  await paymentService.cancelPayment(paymentId);
}
```

## 📊 Statuts de paiement

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `PENDING` | En attente de paiement | Annuler, Vérifier |
| `SUCCESS` | Paiement réussi | Accès au cours |
| `FAILED` | Paiement échoué | Réessayer |
| `CANCELLED` | Paiement annulé | Réessayer |
| `EXPIRED` | Paiement expiré (>15min) | Réessayer |

## 🔐 Mode MOCK

Par défaut, l'API fonctionne en mode MOCK (aucun paiement réel).

### Comportement MOCK
- Tous les paiements retournent `SUCCESS` immédiatement
- Aucun appel à l'API Orange Money réelle
- URL de paiement = URL de callback directement
- Idéal pour développement et tests

### Configuration
```typescript
// Fichier backend: api/routes/payments.js
const MOCK_MODE = process.env.ORANGE_MONEY_MOCK === 'true'; // true par défaut
```

## 🔄 Webhooks

### URL de retour
```typescript
returnUrl: `${window.location.origin}/payment-callback`
// Exemple: https://myschool.app/payment-callback
```

### Paramètres retournés
```
?paymentId=abc123
&status=SUCCESS
&transactionId=OM123456789
```

## 🛠️ Configuration environnement

### Développement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api',
  orangeMoneyMock: true, // Mode MOCK activé
};
```

### Production
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://us-central1-myschool-f862b.cloudfunctions.net/api',
  orangeMoneyMock: false, // Mode réel (nécessite credentials)
};
```

## 📝 Exemples d'utilisation

### Créer un paiement
```typescript
const paymentRequest = {
  enrollmentId: 'enr_123',
  amount: 199900, // 1999 FCFA en centimes
  currency: 'XOF',
  customerName: 'Mamadou Diop',
  customerEmail: 'mamadou@example.com',
  customerPhone: '+221771234567',
  description: 'Paiement cours: Angular Avancé',
  returnUrl: 'https://myschool.app/payment-callback',
};

const payment = await paymentService.createPayment(paymentRequest);
console.log(payment.data.paymentUrl); // URL de redirection
```

### Vérifier un paiement
```typescript
const payment = await paymentService.checkPaymentStatus('pay_123');
console.log(payment.status); // SUCCESS, PENDING, FAILED, etc.
```

### Obtenir l'historique
```typescript
const payments = await paymentService.getUserPayments();
payments.forEach(p => {
  console.log(`${p.description}: ${p.status}`);
});
```

## 🐛 Debugging

### Logs clés
```typescript
// EnrollmentService
console.log('💳 Création du paiement Orange Money...');
console.log('✅ Paiement créé:', payment.data);

// PaymentService
console.log('📤 Requête paiement:', paymentRequest);
console.log('📥 Réponse paiement:', response);

// PaymentCallbackPage
console.log('🔍 Vérification paiement:', paymentId);
console.log('✅ Statut:', payment.status);
```

### Vérifier localStorage
```javascript
// Données client Orange Money
localStorage.getItem('paymentCustomerData')

// Paiement en attente
localStorage.getItem('pendingPaymentId')
localStorage.getItem('pendingEnrollmentId')
localStorage.getItem('pendingCourseId')
```

## ⚠️ Points d'attention

1. **Validation téléphone**: Uniquement Senegal (+221)
2. **Conversion montants**: Toujours multiplier par 100 (FCFA → centimes)
3. **Expiration**: 15 minutes max pour paiement PENDING
4. **Mode MOCK**: Activé par défaut (aucun vrai paiement)
5. **returnUrl**: Doit être une URL absolue et accessible
6. **localStorage**: Nettoyer après succès/échec du paiement

## 🚀 Prochaines étapes

- [ ] Tester le flux complet de paiement
- [ ] Ajouter la page d'historique des paiements
- [ ] Implémenter les notifications push pour statut paiement
- [ ] Ajouter le support Wave et Free Money
- [ ] Gérer les paiements par carte bancaire
- [ ] Mettre en place les webhooks backend
- [ ] Configurer les credentials Orange Money pour production

## 📚 Documentation API

Voir `README.md` section "API Payments (Orange Money v2.1.0)" pour la documentation complète des 10 endpoints.
