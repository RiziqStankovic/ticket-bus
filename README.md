# Ticket Bus

Aplikasi pemesanan tiket bus online dengan Node.js, React, dan PostgreSQL.

## Persyaratan

- Node.js 18+
- PostgreSQL 14+
- npm atau yarn

## Setup

### 1. Database PostgreSQL

Pastikan PostgreSQL sudah terinstall dan berjalan. Buat database baru:

```sql
CREATE DATABASE ticket_bus;
```

### 2. Environment Variables

Salin file `.env.example` ke `.env` di folder `server/`:

```bash
cd server
cp .env.example .env
```

Edit `.env` dan sesuaikan nilai:

- `DATABASE_URL` - URL koneksi PostgreSQL (format: `postgresql://USER:PASSWORD@localhost:5432/ticket_bus`)
- `jwt_secret` - Secret key untuk JWT
- `EMAIL` & `PASSWORD` - Kredensial Gmail untuk kirim email (gunakan App Password)

### 3. Migrasi Database

```bash
cd server
npx prisma migrate deploy
# atau untuk development:
npx prisma migrate dev --name init
```

### 4. Install Dependencies & Jalankan

**Backend:**
```bash
cd server
npm install
npm start
```

**Frontend:**
```bash
cd client
npm install
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Struktur Project

```
ticket-bus/
├── client/          # React frontend
├── server/          # Express backend
│   ├── prisma/      # Schema & migrasi database
│   ├── Controllers/
│   ├── routes/
│   └── config/
└── README.md
```

## Fitur

- Pencarian bus berdasarkan rute dan tanggal
- Pemesanan kursi
- Manajemen bus (admin)
- Manajemen user (admin)
- Reset password via email
- Konfirmasi booking via email
