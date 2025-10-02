# MyGym API Reference

Questa documentazione descrive tutte le API disponibili, i parametri di input e i dettagli degli oggetti restituiti, con riferimento agli schemi Prisma.

---

## Autenticazione

### `POST /api/auth/[...nextauth]`

**Input:**

- `email`: string
- `password`: string
- `entity`: "user" | "gym"

**Output:**

- Sessione JWT con dati utente/gym e ruolo
- Errori: credenziali mancanti, account non trovato, email non verificata, password errata, gym non attivo

---

## Email & Onboarding

### `POST /api/auth/gym/resend-verification`

**Input:**

- `email`: string

**Output:**

- `{ message: "Email verified successfully" }`
- Errori: email mancante, gym non trovato o già verificato

### `POST /api/auth/gym/verify-email`

**Input:**

- `token`: string

**Output:**

- `{ message: "Email verified successfully" }`
- Errori: token mancante, token non valido/scaduto

### `POST /api/auth/user/resend-onboarding`

**Input:**

- `email`: string

**Output:**

- `{ message: "Email verified successfully" }`
- Errori: email mancante, utente non trovato o già registrato

### `POST /api/auth/user/set-password`

**Input:**

- `token`: string
- `password`: string (min 6 caratteri)

**Output:**

- `{ message: "Password set successfully" }`
- Errori: token/password mancanti, password troppo corta, token non valido/scaduto

---

## Gestione Membri Gym

### `POST /api/gym/member/add`

**Input:**

- `email`, `firstName`, `lastName`, `role`, `subscriptionTypeId`, `startDate`, `endDate`

**Output:**

- `{ message: "Member added and email sent" }`
- Errori: campi mancanti, utente già membro

### `DELETE /api/gym/member/delete`

**Input:**

- `userId`: string

**Output:**

- Nessun contenuto (204)
- Errori: userId mancante, membro non trovato

### `GET /api/gym/member/get`

**Input:**

- Nessuno (autenticazione gym)

**Output:**

- Array di oggetti `GymMembership`:

```ts
{
  id: string,
  gymId: string,
  userId: string,
  subscriptionTypeId: string,
  startDate: DateTime,
  endDate?: DateTime,
  status: "PENDING_SETUP" | "ACTIVE" | "INACTIVE" | "EXPIRED",
  role: "ADMIN" | "TRAINER" | "CLIENT",
  createdAt: DateTime,
  updatedAt: DateTime,
  user: {
    id: string,
    firstName: string,
    lastName: string,
    email: string
  },
  subscriptionType: {
    id: string,
    name: string,
    description?: string,
    price: Decimal,
    durationValue: number,
    durationUnit: "DAY" | "WEEK" | "MONTH"
  }
}
```

### `PUT /api/gym/member/update`

**Input:**

- `userId`: string
- `userData`: opzionale (`firstName`, `lastName`)
- `membershipData`: opzionale (`role`, `subscriptionTypeId`, `startDate`, `endDate`, `status`)

**Output:**

- Oggetto `GymMembership` aggiornato (vedi sopra)
- Errori: dati mancanti, membro non trovato

---

## Registrazione Gym

### `POST /api/gym/register`

**Input:**

- `name`, `email`, `password`, `phoneNumber`, `address`, `latitude`, `longitude`

**Output:**

- `{ message: "Gym added and email sent" }`
- Errori: campi mancanti, gym già esistente

---

## Tipi di Abbonamento

### `GET /api/gym/subscription-type/get`

**Input:**

- `gymId` (query param)

**Output:**

- Array di oggetti `SubscriptionType`:

```ts
{
  id: string,
  name: string,
  description?: string,
  price: Decimal,
  durationValue: number,
  durationUnit: "DAY" | "WEEK" | "MONTH"
}
```

### `GET /api/gym/subscription-type/protected/get`

**Input:**

- Nessuno (autenticazione gym)

**Output:**

- Array di oggetti `SubscriptionType` (vedi sopra)

### `POST /api/gym/subscription-type/protected/create`

**Input:**

- `subscriptions`: array di oggetti `{ name, price, durationValue, durationUnit, description }`

**Output:**

- Array di oggetti `SubscriptionType` creati
- Errori: dati mancanti, abbonamento già esistente

### `PATCH /api/gym/subscription-type/protected/archive`

**Input:**

- `id`: string

**Output:**

- Nessun contenuto (204)
- Errori: id mancante, abbonamento non trovato

### `PATCH /api/gym/subscription-type/protected/restore`

**Input:**

- `id`: string

**Output:**

- Oggetto `SubscriptionType` riattivato
- Errori: id mancante, abbonamento non trovato

### `PUT /api/gym/subscription-type/protected/update`

**Input:**

- `id`, `name`, `description`, `price`, `durationValue`, `durationUnit`

**Output:**

- Oggetto `SubscriptionType` aggiornato
- Errori: dati mancanti, abbonamento non trovato, abbonamento già esistente

### `DELETE /api/gym/subscription-type/protected/delete`

**Input:**

- `id`: string

**Output:**

- Nessun contenuto (204)
- Errori: id mancante, abbonamento non trovato, abbonamento in uso

---

## Modelli Prisma di riferimento

### `Gym`

- id, name, email, hashedPassword, phoneNumber, address, latitude, longitude, status, emailVerified, createdAt, updatedAt

### `User`

- id, firstName, lastName, email, hashedPassword, createdAt, updatedAt

### `SubscriptionType`

- id, name, description, price, durationValue, durationUnit, gymId, isActive

### `GymMembership`

- id, gymId, userId, subscriptionTypeId, startDate, endDate, status, role, createdAt, updatedAt

### `OnboardingToken`

- id, token, expires, userId

### `GymVerificationToken`

- id, token, expires, gymId

---

Per dettagli su errori o logiche specifiche, consulta il codice sorgente delle route o lo schema Prisma.
