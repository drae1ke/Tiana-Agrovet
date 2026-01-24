import { Product, Supplier } from '@/types';
import { getProducts, saveProducts, getSuppliers, saveSuppliers } from './storage';

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Sample suppliers
const sampleSuppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'Kenya Seed Company',
    phone: '+254722000001',
    email: 'sales@kenyaseed.co.ke',
    address: 'Kitale, Kenya',
    products: [],
    isTrusted: true,
    autoOrderEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup2',
    name: 'Twiga Chemicals',
    phone: '+254722000002',
    email: 'orders@twigachemicals.co.ke',
    address: 'Nairobi, Kenya',
    products: [],
    isTrusted: true,
    autoOrderEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sup3',
    name: 'Highchem EA Ltd',
    phone: '+254722000003',
    email: 'info@highchem.co.ke',
    address: 'Mombasa, Kenya',
    products: [],
    isTrusted: false,
    autoOrderEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Sample products with expiry dates and varied stock levels
const sampleProducts: Product[] = [
  // Seeds
  {
    id: generateId(),
    name: 'Maize Seeds - DK 777',
    nameSwahili: 'Mbegu za Mahindi - DK 777',
    category: 'seeds',
    sku: 'SEED-001',
    quantity: 50,
    minStockLevel: 20,
    buyingPrice: 350,
    sellingPrice: 450,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    batchNumber: 'B2024-001',
    supplierId: 'sup1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Bean Seeds - Rose Coco',
    nameSwahili: 'Mbegu za Maharage - Rose Coco',
    category: 'seeds',
    sku: 'SEED-002',
    quantity: 8, // Low stock
    minStockLevel: 15,
    buyingPrice: 200,
    sellingPrice: 280,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
    batchNumber: 'B2024-002',
    supplierId: 'sup1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Tomato Seeds - Cal J',
    nameSwahili: 'Mbegu za Nyanya - Cal J',
    category: 'seeds',
    sku: 'SEED-003',
    quantity: 30,
    minStockLevel: 10,
    buyingPrice: 150,
    sellingPrice: 220,
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days - expiring soon
    batchNumber: 'B2024-003',
    supplierId: 'sup1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Fertilizers
  {
    id: generateId(),
    name: 'DAP Fertilizer 50kg',
    nameSwahili: 'Mbolea ya DAP 50kg',
    category: 'fertilizers',
    sku: 'FERT-001',
    quantity: 25,
    minStockLevel: 10,
    buyingPrice: 4500,
    sellingPrice: 5200,
    expiryDate: null, // No expiry
    batchNumber: 'B2024-F01',
    supplierId: 'sup2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'CAN Fertilizer 50kg',
    nameSwahili: 'Mbolea ya CAN 50kg',
    category: 'fertilizers',
    sku: 'FERT-002',
    quantity: 5, // Low stock
    minStockLevel: 10,
    buyingPrice: 3800,
    sellingPrice: 4500,
    expiryDate: null,
    batchNumber: 'B2024-F02',
    supplierId: 'sup2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'NPK 17:17:17 50kg',
    nameSwahili: 'Mbolea NPK 17:17:17 50kg',
    category: 'fertilizers',
    sku: 'FERT-003',
    quantity: 18,
    minStockLevel: 8,
    buyingPrice: 4200,
    sellingPrice: 4900,
    expiryDate: null,
    batchNumber: 'B2024-F03',
    supplierId: 'sup2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Pesticides
  {
    id: generateId(),
    name: 'Thunder OD 145 SC',
    nameSwahili: 'Dawa ya Wadudu Thunder',
    category: 'pesticides',
    sku: 'PEST-001',
    quantity: 40,
    minStockLevel: 15,
    buyingPrice: 1200,
    sellingPrice: 1500,
    expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
    batchNumber: 'B2024-P01',
    supplierId: 'sup2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Duduthrin 1.75 EC',
    nameSwahili: 'Dawa ya Wadudu Duduthrin',
    category: 'pesticides',
    sku: 'PEST-002',
    quantity: 3, // Low stock
    minStockLevel: 10,
    buyingPrice: 800,
    sellingPrice: 1100,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days - expiring very soon
    batchNumber: 'B2024-P02',
    supplierId: 'sup2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Veterinary
  {
    id: generateId(),
    name: 'Albendazole 10% - 100ml',
    nameSwahili: 'Dawa ya Minyoo Albendazole',
    category: 'veterinary',
    sku: 'VET-001',
    quantity: 35,
    minStockLevel: 15,
    buyingPrice: 450,
    sellingPrice: 600,
    expiryDate: new Date(Date.now() + 545 * 24 * 60 * 60 * 1000).toISOString(), // 18 months
    batchNumber: 'B2024-V01',
    supplierId: 'sup3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Oxytetracycline 20%',
    nameSwahili: 'Dawa ya Maambukizi Oxytet',
    category: 'veterinary',
    sku: 'VET-002',
    quantity: 20,
    minStockLevel: 10,
    buyingPrice: 850,
    sellingPrice: 1100,
    expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days - warning
    batchNumber: 'B2024-V02',
    supplierId: 'sup3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Tools
  {
    id: generateId(),
    name: 'Knapsack Sprayer 16L',
    nameSwahili: 'Kipuliziaji cha Mgongoni 16L',
    category: 'tools',
    sku: 'TOOL-001',
    quantity: 12,
    minStockLevel: 5,
    buyingPrice: 3500,
    sellingPrice: 4500,
    expiryDate: null,
    batchNumber: 'B2024-T01',
    supplierId: 'sup3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Garden Hoe',
    nameSwahili: 'Jembe la Bustani',
    category: 'tools',
    sku: 'TOOL-002',
    quantity: 2, // Low stock
    minStockLevel: 8,
    buyingPrice: 350,
    sellingPrice: 500,
    expiryDate: null,
    batchNumber: 'B2024-T02',
    supplierId: 'sup3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Panga - 18 inch',
    nameSwahili: 'Panga - Inchi 18',
    category: 'tools',
    sku: 'TOOL-003',
    quantity: 15,
    minStockLevel: 5,
    buyingPrice: 280,
    sellingPrice: 400,
    expiryDate: null,
    batchNumber: 'B2024-T03',
    supplierId: 'sup3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initializeSeedData = (): void => {
  // Check if data already exists
  const existingProducts = getProducts();
  const existingSuppliers = getSuppliers();

  if (existingSuppliers.length === 0) {
    saveSuppliers(sampleSuppliers);
  }

  if (existingProducts.length === 0) {
    saveProducts(sampleProducts);
  }
};
