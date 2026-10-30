import { Product, ProductionBatch, StageRecord, ProductionStage, DiscrepancyReport, AuthUser, UserRole } from '../types';

export const STAGES_LIST: ProductionStage[] = ['Cutting', 'Stitching', 'QC', 'Finishing', 'Packing'];

export const DEFECT_OPTIONS: Record<ProductionStage, string[]> = {
  Cutting: [
    'Bad cut alignment',
    'Pattern notch misalignment',
    'Fabric flaw / weave knot',
    'Uneven fabric lay tension',
    'Burn / friction marks',
    'Operator scissor error',
    'Other Cutting Defect'
  ],
  Stitching: [
    'Wrong size join',
    'Broken stitch / needle skip',
    'Uneven seam allowance',
    'Open seam / loose thread',
    'Fabric puckering',
    'Collar asymmetrical stitch',
    'Other Stitching Defect'
  ],
  QC: [
    'Fabric tear / hole',
    'Visible oil / machine stain',
    'Measurement tolerance exceeded',
    'Color shade variation',
    'Loose buttons / faulty snaps',
    'Collar shape deformation',
    'Other QC Defect'
  ],
  Finishing: [
    'Iron heat scorch / burn mark',
    'Iron water steam watermark',
    'Press shine on dark fabric',
    'Wrinkle setting failure',
    'Hangtag barcode tear',
    'Other Finishing Damage'
  ],
  Packing: [
    'Damaged polybag / carton crush',
    'Wrong barcode sticker affixed',
    'Missing swing tag',
    'Incorrect size label folded',
    'Moisture silica gel leak',
    'Other Packaging Defect'
  ]
};

export const MISSING_REASONS_SUGGESTIONS: string[] = [
  'Bundle count discrepancy from source',
  'Dropped behind conveyor / machine table',
  'Fabric off-cut mixed into scrap bin mistakenly',
  'Damaged piece discarded without recording',
  'Sent for sample verification / lab test',
  'Misplaced in transit between workstations',
  'Tally recount error during shift handover'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_code: 'SHT-001',
    product_name: 'Cotton Oxford Classic Shirt',
    category: 'Shirt',
    sizes_available: ['S', 'M', 'L', 'XL', 'XXL'],
    colors_available: ['White', 'Sky Blue', 'Navy', 'Charcoal'],
    description: '100% combed cotton, regular fit button-down shirt',
    created_at: '2026-01-15'
  },
  {
    product_code: 'TRS-002',
    product_name: 'Raw Selvedge Denim Trouser',
    category: 'Trouser',
    sizes_available: ['30', '32', '34', '36', '38'],
    colors_available: ['Indigo', 'Faded Blue', 'Washed Black'],
    description: '13.5oz ring-spun denim with reinforced copper rivets',
    created_at: '2026-02-01'
  },
  {
    product_code: 'JKT-003',
    product_name: 'Canvas Heavy Utility Jacket',
    category: 'Jacket',
    sizes_available: ['S', 'M', 'L', 'XL'],
    colors_available: ['Olive Green', 'Tan Brown', 'Black'],
    description: 'Duck canvas with brushed flannel lining and brass hardware',
    created_at: '2026-02-10'
  }
];

export const INITIAL_BATCHES: ProductionBatch[] = [
  {
    batch_no: 'BATCH-2026-001',
    product_code: 'SHT-001',
    product_name: 'Cotton Oxford Classic Shirt',
    size: 'M',
    color: 'Sky Blue',
    date_created: '2026-10-18',
    total_planned_qty: 500,
    current_stage: 'Completed',
    status: 'Completed',
    created_by: 'Supervisor Robert',
    target_delivery_date: '2026-10-28',
    notes: 'Priority export order for retail partner'
  },
  {
    batch_no: 'BATCH-2026-002',
    product_code: 'TRS-002',
    product_name: 'Raw Selvedge Denim Trouser',
    size: '32',
    color: 'Indigo',
    date_created: '2026-10-21',
    total_planned_qty: 300,
    current_stage: 'QC',
    status: 'Active',
    created_by: 'Production Mgr Linda',
    target_delivery_date: '2026-11-05',
    notes: 'Double needle stitch inspection required'
  },
  {
    batch_no: 'BATCH-2026-003',
    product_code: 'JKT-003',
    product_name: 'Canvas Heavy Utility Jacket',
    size: 'L',
    color: 'Olive Green',
    date_created: '2026-10-23',
    total_planned_qty: 150,
    current_stage: 'Cutting',
    status: 'Active',
    created_by: 'Supervisor Robert',
    target_delivery_date: '2026-11-12',
    notes: 'Heavyweight cutting knife calibrated'
  }
];

export const INITIAL_STAGE_RECORDS: StageRecord[] = [
  // BATCH-2026-001 Cutting
  {
    id: 'REC-001-CUT',
    batch_no: 'BATCH-2026-001',
    stage_name: 'Cutting',
    date: '2026-10-18',
    time_in: '08:30',
    operator_name: 'Carlos Mendez (Cutter #1)',
    qty_received: 500,
    qty_passed: 492,
    qty_rejected: 5,
    qty_missing: 3,
    rejection_reason: 'Bad cut alignment on collar plackets',
    missing_reason: '3 panel sections damaged during lay spread and discarded without recording',
    fabric_rolls_used: 12,
    defect_type: 'Bad cut alignment',
    remarks: 'Roll #4 had edge curl issue',
    submitted_at: '2026-10-18T14:45:00Z',
    created_by: 'Carlos Mendez'
  },
  // BATCH-2026-001 Stitching
  {
    id: 'REC-001-STITCH',
    batch_no: 'BATCH-2026-001',
    stage_name: 'Stitching',
    date: '2026-10-19',
    time_in: '09:00',
    operator_name: 'Amina Khatun (Sewing Lead)',
    qty_received: 492,
    qty_passed: 480,
    qty_rejected: 10,
    qty_missing: 2,
    rejection_reason: 'Broken stitch and uneven sleeve seam allowance',
    missing_reason: '2 bundles lost cuff components during transit between machine tables',
    defect_type: 'Broken stitch / needle skip',
    remarks: 'Line 2 high-speed machine calibrated mid-shift',
    submitted_at: '2026-10-19T17:15:00Z',
    created_by: 'Amina Khatun'
  },
  // BATCH-2026-001 QC
  {
    id: 'REC-001-QC',
    batch_no: 'BATCH-2026-001',
    stage_name: 'QC',
    date: '2026-10-20',
    time_in: '08:15',
    operator_name: 'David Vance (Senior QC)',
    qty_received: 480,
    qty_passed: 465,
    qty_rework: 0,
    qty_rejected: 12,
    qty_missing: 3,
    rejection_reason: 'Non-removable machine oil stains and uneven collar symmetry',
    missing_reason: 'Discrepancy identified between stitching tally ticket and physical bin count',
    defect_type: 'Visible oil / machine stain',
    remarks: 'Grade A garments sealed and sent to ironing',
    submitted_at: '2026-10-20T16:00:00Z',
    created_by: 'David Vance'
  },
  // BATCH-2026-001 Finishing
  {
    id: 'REC-001-FIN',
    batch_no: 'BATCH-2026-001',
    stage_name: 'Finishing',
    date: '2026-10-21',
    time_in: '10:00',
    operator_name: 'Fatima Noor (Ironing Station)',
    qty_received: 465,
    qty_passed: 462,
    qty_rejected: 2,
    qty_missing: 1,
    rejection_reason: 'Excessive iron heat burn on back shoulder panel',
    missing_reason: '1 unit dropped behind steam boiler, deemed unsafe for retrieval during live line',
    damage_reason: 'Iron heat scorch / burn mark',
    remarks: 'Press temperature lowered to 160C',
    submitted_at: '2026-10-21T15:30:00Z',
    created_by: 'Fatima Noor'
  },
  // BATCH-2026-001 Packing
  {
    id: 'REC-001-PACK',
    batch_no: 'BATCH-2026-001',
    stage_name: 'Packing',
    date: '2026-10-22',
    time_in: '09:00',
    operator_name: 'Samuel Lee (Packaging Mgr)',
    qty_received: 462,
    qty_passed: 460,
    qty_rejected: 1,
    qty_missing: 1,
    rejection_reason: 'Polybag seal rupture and barcode label misprint',
    missing_reason: 'Carton pack count short by 1 item during outer box barcode scan',
    packed_by_size: { 'S': 90, 'M': 200, 'L': 120, 'XL': 50 },
    packed_by_color: { 'Sky Blue': 460 },
    remarks: 'Final 460 pieces boxed into 23 master cartons ready for dispatch',
    submitted_at: '2026-10-22T14:00:00Z',
    created_by: 'Samuel Lee'
  },

  // BATCH-2026-002 Cutting
  {
    id: 'REC-002-CUT',
    batch_no: 'BATCH-2026-002',
    stage_name: 'Cutting',
    date: '2026-10-21',
    time_in: '08:00',
    operator_name: 'Carlos Mendez (Cutter #1)',
    qty_received: 300,
    qty_passed: 298,
    qty_rejected: 2,
    qty_missing: 0,
    rejection_reason: 'Defective selvage edge frayed on front pocket piece',
    fabric_rolls_used: 8,
    defect_type: 'Fabric flaw / weave knot',
    remarks: 'Zero missing pieces',
    submitted_at: '2026-10-21T12:00:00Z',
    created_by: 'Carlos Mendez'
  },
  // BATCH-2026-002 Stitching
  {
    id: 'REC-002-STITCH',
    batch_no: 'BATCH-2026-002',
    stage_name: 'Stitching',
    date: '2026-10-22',
    time_in: '08:30',
    operator_name: 'Amina Khatun (Sewing Lead)',
    qty_received: 298,
    qty_passed: 292,
    qty_rejected: 4,
    qty_missing: 2,
    rejection_reason: 'Wrong rivet punch tearing denim waistband',
    missing_reason: '2 back pocket cut components missing from bundle bundle #7',
    defect_type: 'Wrong size join',
    remarks: 'Waiting for QC inspection',
    submitted_at: '2026-10-22T16:45:00Z',
    created_by: 'Amina Khatun'
  }
];

export const INITIAL_DISCREPANCIES: DiscrepancyReport[] = [
  {
    id: 'DISC-001',
    batch_no: 'BATCH-2026-002',
    stage_name: 'QC',
    current_operator: 'David Vance (Senior QC)',
    previous_stage: 'Stitching',
    previous_operator: 'Amina Khatun (Sewing Lead)',
    type: 'Shortage (Received Less)',
    expected_qty: 298,
    counted_qty: 292,
    variance_qty: -6,
    message: 'Bundle #7 tally ticket showed 298 pieces passed stitching, but QC bin physical recount arrived with 292 pieces (6 pieces missing from handoff).',
    status: 'Reported to Admin',
    reported_at: '2026-10-22T17:00:00Z'
  }
];

const STORAGE_KEYS = {
  PRODUCTS: 'taskora_products_v1',
  BATCHES: 'taskora_batches_v1',
  STAGE_RECORDS: 'taskora_stage_records_v1',
  DISCREPANCIES: 'taskora_discrepancies_v1',
  CURRENT_USER_ROLE: 'taskora_user_role_v1',
  CURRENT_USER_NAME: 'taskora_user_name_v1',
  AUTH_USER: 'taskora_auth_user_v1'
};

export interface UserPreset {
  username: string;
  name: string;
  role: UserRole;
  employeeId: string;
  department: string;
  password?: string;
  description: string;
  badgeColor: string;
}

export const DEFAULT_USERS: UserPreset[] = [
  {
    username: 'admin',
    name: 'Elena Rostova',
    role: 'Admin',
    employeeId: 'ADM-101',
    department: 'Plant Operations & Governance',
    password: 'admin',
    description: 'Full facility access, master batch configuration & incident resolution.',
    badgeColor: '#8B5CF6'
  },
  {
    username: 'supervisor',
    name: 'Marcus Brody',
    role: 'Stage Supervisor',
    employeeId: 'SUP-204',
    department: 'Floor Production Lines 1-4',
    password: 'supervisor',
    description: 'Stage transitions, throughput oversight & discrepancy dispatch.',
    badgeColor: '#06B6D4'
  },
  {
    username: 'operator',
    name: 'Amina Khatun',
    role: 'Operator',
    employeeId: 'OPR-382',
    department: 'Cutting & Sewing Line A',
    password: 'operator',
    description: 'Piece counts logging, intake verification & mandatory missing remarks.',
    badgeColor: '#F59E0B'
  },
  {
    username: 'qc_inspector',
    name: 'David Vance',
    role: 'QC Inspector',
    employeeId: 'QC-419',
    department: 'Quality Assurance & Defect Audit',
    password: 'qc',
    description: 'Inspection tollgate, rework classification & scrap auditing.',
    badgeColor: '#10B981'
  },
  {
    username: 'viewer',
    name: 'Auditor Guest',
    role: 'Viewer',
    employeeId: 'AUD-901',
    department: 'External Compliance / Client Audit',
    password: 'viewer',
    description: 'Read-only batch inspection, yield efficiency metrics & CSV exports.',
    badgeColor: '#6B7280'
  }
];

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveAuthUser = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, user.role);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_NAME, user.name);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_NAME);
  }
};

export const getStoredDiscrepancies = (): DiscrepancyReport[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DISCREPANCIES);
    return data ? JSON.parse(data) : INITIAL_DISCREPANCIES;
  } catch {
    return INITIAL_DISCREPANCIES;
  }
};

export const saveDiscrepancies = (reports: DiscrepancyReport[]) => {
  localStorage.setItem(STORAGE_KEYS.DISCREPANCIES, JSON.stringify(reports));
};

export const getStoredProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredBatches = (): ProductionBatch[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
    return data ? JSON.parse(data) : INITIAL_BATCHES;
  } catch {
    return INITIAL_BATCHES;
  }
};

export const saveBatches = (batches: ProductionBatch[]) => {
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
};

export const getStoredStageRecords = (): StageRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STAGE_RECORDS);
    return data ? JSON.parse(data) : INITIAL_STAGE_RECORDS;
  } catch {
    return INITIAL_STAGE_RECORDS;
  }
};

export const saveStageRecords = (records: StageRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.STAGE_RECORDS, JSON.stringify(records));
};

export const resetStorageToDefaults = () => {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.BATCHES);
  localStorage.removeItem(STORAGE_KEYS.STAGE_RECORDS);
  localStorage.removeItem(STORAGE_KEYS.DISCREPANCIES);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
  localStorage.setItem(STORAGE_KEYS.STAGE_RECORDS, JSON.stringify(INITIAL_STAGE_RECORDS));
  localStorage.setItem(STORAGE_KEYS.DISCREPANCIES, JSON.stringify(INITIAL_DISCREPANCIES));
};
