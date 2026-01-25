# Mi Finanzas - Finance Tracker

A fast, spreadsheet-like finance tracker built with Next.js 14, TypeScript, and TailwindCSS. Currently uses localStorage for persistence, designed for easy database integration.

## Features

- **Pagos del mes**: Fixed monthly payments with name, amount, and optional due date
- **Gastos del mes**: Expense buckets (Rappi, Colpatria, Falabella, Lulo Bank, Savings, Cash) with quick add/edit/delete
- **Resumen**: Summary view with totals per bucket, fixed payments total, grand total, monthly limit, and remaining
- **Month selector**: Navigate between months (YYYY-MM format)
- **Export/Import**: JSON export and import for data backup/restore
- **Responsive**: Desktop columns view, mobile tabs view

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- localStorage (for persistence)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── FixedPayments.tsx  # Fixed payments list
│   ├── ExpenseBuckets.tsx # Expense buckets (desktop columns/mobile tabs)
│   ├── Summary.tsx        # Summary view
│   ├── MonthSelector.tsx  # Month selector
│   └── ExportImport.tsx   # Export/Import buttons
├── hooks/                 # Custom React hooks
│   └── useMonthData.ts    # Data management hook
├── lib/                   # Utilities
│   ├── currency.ts        # Currency formatting (COP)
│   ├── date.ts           # Date utilities
│   └── summary.ts        # Summary calculations
└── types/                # TypeScript types
    └── index.ts          # Data models (maps 1:1 to future DB schema)
```

## Data Models

All types in `types/index.ts` are designed to map 1:1 to a future database schema:

- **MonthData**: Complete month data (month, fixedPayments, expenses, monthlyLimit)
- **FixedPayment**: Payment with id, name, amount (integer cents), optional dueDate
- **Expense**: Expense with id, name, amount (integer cents), bucket
- **ExpenseBucket**: Union type for bucket names

Amounts are stored as integers (cents) to avoid floating-point precision issues.

## Next Steps: Database Integration

### 1. Choose Database

Recommended options:
- **PostgreSQL**: Best for relational data with Prisma/TypeORM
- **MongoDB**: If you prefer NoSQL with Mongoose
- **Supabase**: PostgreSQL with built-in auth and real-time
- **Firebase/Firestore**: NoSQL with real-time capabilities

### 2. Update `useMonthData` Hook

Replace localStorage calls with API calls:

```typescript
// Before (localStorage)
function loadMonthData(month: string): MonthData {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : getInitialMonthData(month);
}

// After (API)
async function loadMonthData(month: string): Promise<MonthData> {
  const response = await fetch(`/api/months/${month}`);
  return response.json();
}
```

### 3. Create API Routes

Create Next.js API routes in `app/api/`:

```
app/api/
├── months/
│   ├── [month]/
│   │   ├── route.ts       # GET, PUT month data
│   │   ├── payments/
│   │   │   └── route.ts   # POST, PUT, DELETE fixed payments
│   │   └── expenses/
│   │       └── route.ts   # POST, PUT, DELETE expenses
```

### 4. Database Schema

Example PostgreSQL schema (matches TypeScript types):

```sql
CREATE TABLE months (
  month VARCHAR(7) PRIMARY KEY, -- YYYY-MM
  monthly_limit BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fixed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) REFERENCES months(month),
  name VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL, -- stored in cents
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month VARCHAR(7) REFERENCES months(month),
  name VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL, -- stored in cents
  bucket VARCHAR(20) NOT NULL CHECK (bucket IN ('rappi', 'colpatria', 'falabella', 'lulobank', 'savings', 'cash')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_month ON expenses(month);
CREATE INDEX idx_expenses_bucket ON expenses(bucket);
CREATE INDEX idx_fixed_payments_month ON fixed_payments(month);
```

### 5. Using Prisma (Example)

If using Prisma:

```bash
npm install prisma @prisma/client
npx prisma init
```

Update `prisma/schema.prisma`:

```prisma
model Month {
  month        String          @id @db.VarChar(7)
  monthlyLimit BigInt          @default(0)
  fixedPayments FixedPayment[]
  expenses     Expense[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

model FixedPayment {
  id       String   @id @default(uuid())
  monthId  String   @map("month")
  month    Month    @relation(fields: [monthId], references: [month])
  name     String
  amount   BigInt
  dueDate  DateTime? @map("due_date")
  createdAt DateTime @default(now()) @map("created_at")
}

model Expense {
  id        String   @id @default(uuid())
  monthId   String   @map("month")
  month     Month    @relation(fields: [monthId], references: [month])
  name      String
  amount    BigInt
  bucket    String
  createdAt DateTime @default(now()) @map("created_at")
}
```

### 6. Update API Routes

Example API route using Prisma:

```typescript
// app/api/months/[month]/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { month: string } }
) {
  const monthData = await prisma.month.findUnique({
    where: { month: params.month },
    include: {
      fixedPayments: true,
      expenses: true,
    },
  });

  if (!monthData) {
    // Auto-create if doesn't exist
    return prisma.month.create({
      data: { month: params.month, monthlyLimit: 0 },
      include: {
        fixedPayments: true,
        expenses: true,
      },
    });
  }

  return Response.json(monthData);
}
```

### 7. Migration Strategy

When moving from localStorage to database:

1. Export all data from localStorage (use existing Export JSON feature)
2. Create a migration script to import data into database
3. Update `useMonthData` to use API calls instead of localStorage
4. Test thoroughly before removing localStorage fallback

## Development Notes

- Amounts stored as integers (cents) to avoid floating-point precision
- Currency formatting uses `Intl.NumberFormat` for COP
- Month format: `YYYY-MM` (e.g., "2024-03")
- Desktop: buckets shown in columns (responsive grid)
- Mobile: buckets shown in tabs (single bucket at a time)
- Enter key submits forms, Escape cancels editing
- Auto-focus on name input after adding expense

## License

MIT
