export type User = { id: number; name: string; role: string };
export type Account = { id: number; type: string; balance: number };
export type Product = { id: number; sku: string; name: string; price: number };
export type Patient = { id: number; name: string; condition: string };

export type TenantData = {
  users: User[];
  accounts?: Account[];
  products?: Product[];
  patients?: Patient[];
};

export type Tenants = { [tenantId: string]: TenantData };

export const tenants: Tenants = {
  bankcorp: {
    users: [
      { id: 1, name: "Alice", role: "Relationship Manager" },
      { id: 2, name: "Raj", role: "Credit Analyst" },
      { id: 3, name: "Meera", role: "Compliance Officer" }
    ],
    accounts: [
      { id: 101, type: "Savings", balance: 20000 },
      { id: 102, type: "Loan", balance: -500000 },
      { id: 103, type: "Checking", balance: 1200 }
    ]
  },
  retailx: {
    users: [
      { id: 1, name: "Priya", role: "Store Manager" },
      { id: 2, name: "John", role: "Inventory Analyst" },
      { id: 3, name: "Sana", role: "Cashier" }
    ],
    products: [
      { id: 201, sku: "SKU-001", name: "Notebook", price: 79 },
      { id: 202, sku: "SKU-002", name: "Pen", price: 15 },
      { id: 203, sku: "SKU-003", name: "USB Cable", price: 149 }
    ]
  },
  healthplus: {
    users: [
      { id: 1, name: "Dr. Kumar", role: "Physician" },
      { id: 2, name: "Latha", role: "Nurse" },
      { id: 3, name: "Abdul", role: "Receptionist" }
    ],
    patients: [
      { id: 301, name: "Reena", condition: "Hypertension" },
      { id: 302, name: "Manoj", condition: "Diabetes" },
      { id: 303, name: "Sara", condition: "Asthma" }
    ]
  }
};

export const validTenants = Object.keys(tenants);
