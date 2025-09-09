# 🔔 Configuration des Notifications - Terranga VTC Services

## 📧 Configuration Email (Resend)

### 1. Créer un compte Resend
1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### 2. Configurer le domaine
1. Dans le dashboard Resend, allez dans "Domains"
2. Ajoutez votre domaine `terrangavtc.fr`
3. Configurez les enregistrements DNS :
   ```
   Type: MX
   Name: @
   Value: feedback-smtp.eu-west-1.amazonses.com
   Priority: 10
   ```

### 3. Obtenir la clé API
1. Allez dans "API Keys"
2. Créez une nouvelle clé API
3. Copiez la clé qui commence par `re_`

### 4. Ajouter à Supabase
1. Allez dans votre projet Supabase
2. Settings → Edge Functions → Environment Variables
3. Ajoutez :
   ```
   RESEND_API_KEY=re_votre_cle_api_ici
   ```

---

## 📱 Configuration SMS (Twilio)

### 1. Créer un compte Twilio
1. Allez sur [twilio.com](https://twilio.com)
2. Créez un compte gratuit (15$ de crédit offert)
3. Vérifiez votre numéro de téléphone

### 2. Obtenir les identifiants
1. Dans le dashboard Twilio, notez :
   - **Account SID** (commence par AC...)
   - **Auth Token** (cliquez sur "Show" pour le voir)

### 3. Acheter un numéro de téléphone
1. Allez dans "Phone Numbers" → "Manage" → "Buy a number"
2. Choisissez un numéro français (+33)
3. Activez les SMS
4. Notez le numéro au format international (+33...)

### 4. Ajouter à Supabase
1. Allez dans votre projet Supabase
2. Settings → Edge Functions → Environment Variables
3. Ajoutez :
   ```
   TWILIO_ACCOUNT_SID=ACvotre_account_sid_ici
   TWILIO_AUTH_TOKEN=votre_auth_token_ici
   TWILIO_PHONE_NUMBER=+33votre_numero_ici
   ```

---

## 🚀 Test des Notifications

### Test Email
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer votre_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "terrangavtcservices@outlook.fr",
    "subject": "Test de notification",
    "message": "Ceci est un test."
  }'
```

### Test SMS
```bash
curl -X POST https://votre-projet.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer votre_anon_key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33774683800",
    "message": "Test SMS Terranga VTC"
  }'
```

---

## 💰 Coûts

### Resend (Email)
- **Gratuit** : 3,000 emails/mois
- **Pro** : 10€/mois pour 50,000 emails

### Twilio (SMS)
- **SMS France** : ~0.08€ par SMS
- **Crédit gratuit** : 15€ à l'inscription

---

## 🔧 Dépannage

### Email ne fonctionne pas
1. Vérifiez que le domaine est vérifié dans Resend
2. Vérifiez la clé API dans Supabase
3. Regardez les logs dans Supabase Functions

### SMS ne fonctionne pas
1. Vérifiez le crédit Twilio
2. Vérifiez que le numéro est au bon format (+33...)
3. Vérifiez les identifiants dans Supabase

### Notifications push
1. Autorisez les notifications dans le navigateur
2. Gardez l'onglet ouvert en arrière-plan

---

## 📞 Support

Pour toute question :
- Email : terrangavtcservices@outlook.fr
- Téléphone : 07 74 68 38 00