import prisma from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed process...');

  // 1. Clean up existing database tables
  await prisma.report.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.delayAlert.deleteMany({});
  await prisma.systemNotification.deleteMany({});
  await prisma.hearing.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.opposition.deleteMany({});
  await prisma.patentCase.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('Database tables cleared.');

  // 2. Create Roles
  const roles = [
    { id: 'ADMIN', name: 'Admin' },
    { id: 'OFFICER', name: 'Patent Officer' },
    { id: 'APPLICANT', name: 'Applicant' },
    { id: 'OPPONENT', name: 'Opposition Party' },
  ];

  for (const r of roles) {
    await prisma.role.create({ data: r });
  }
  console.log('Roles seeded.');

  // 3. Create Users (passwords hashed with bcryptjs)
  const passwordHash = await bcrypt.hash('password123', 10);

  const seededUsers = [
    {
      id: 'U-01',
      name: 'Admin User',
      email: 'admin.poms@ipindia.gov.in',
      password: passwordHash,
      roleId: 'ADMIN',
      organization: 'Indian Patent Intellectual Property Office',
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'U-02',
      name: 'Dr. Helena Vance',
      email: 'h.vance@ipindia.gov.in',
      password: passwordHash,
      roleId: 'OFFICER',
      organization: 'Patent Examination Division',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'U-03',
      name: 'Sarah Miller',
      email: 's.miller@neuralq.com',
      password: passwordHash,
      roleId: 'APPLICANT',
      organization: 'Neural-Q Systems International Ltd.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'U-04',
      name: 'Robert Chen',
      email: 'r.chen@smartpharma.com',
      password: passwordHash,
      roleId: 'OPPONENT',
      organization: 'Omni-Pharma Quantum Res.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  for (const u of seededUsers) {
    await prisma.user.create({ data: u });
  }
  console.log('Users seeded.');

  // 4. Create Patent Cases
  const patentCases = [
    {
      id: 'PAT-2024-0892',
      title: 'Quantum Computing Logic Gate Optimization via Topological Entanglement',
      description: 'Method and apparatus for optimizing logic gate distribution within a quantum processing unit. Utilizing topological error correction and specific entanglement patterns to reduce decoherence rates during multi-qubit operations.',
      applicantName: 'Sarah Miller',
      applicantOrganization: 'Neural-Q Systems International Ltd.',
      filingDate: '2026-04-04',
      category: 'Quantum Processing',
      status: 'Opposition Filed',
      priority: 'High',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 65, // Orange Severity trigger (>60 days)
      ipcClassification: 'G06N 10/00; H03K 19/00',
      priorityDate: '2023-01-14',
      abstractSummary: 'Optimizes qubit gate mapping layout structures by constructing topographically sound braided circuits supporting fast fault-tolerant logic execution.',
    },
    {
      id: 'US-102948-B2',
      title: 'Adaptive Neural Network for Quantum Processing Units',
      description: 'A reinforcement learning network implemented on-chip to dynamically calibration superconducting qubits and balance cryo-controller workloads.',
      applicantName: 'DeepFlow Systems Inc.',
      applicantOrganization: 'DeepFlow Systems Inc.',
      filingDate: '2026-05-27',
      category: 'Software / AI',
      status: 'Opposition Filed',
      priority: 'High',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 12, // Green Severity
      ipcClassification: 'G06N 3/04; H03K 17/00',
      priorityDate: '2023-10-12',
      abstractSummary: 'Uses secondary calibration layers feedback loops to stabilize decoherence limits dynamically.',
    },
    {
      id: 'EP-485921-A1',
      title: 'Biodegradable Polymer Synthesis and Rapid Curing Method',
      description: 'Environmentally safe biocompatible polymer formulated from sustainable starch and lactic structures engineered for surgical implants.',
      applicantName: 'BioLab Europe Ltd.',
      applicantOrganization: 'BioLab Europe Ltd.',
      filingDate: '2026-04-24',
      category: 'Chemical Engineering',
      status: 'Under Examination',
      priority: 'Medium',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 45, // Yellow Severity (>30 days)
      ipcClassification: 'C08G 63/06; A61L 31/06',
      priorityDate: '2024-01-05',
      abstractSummary: 'A novel esterification cascade minimizing volatile auxiliary plasticizer byproducts while maintaining high mechanical structural load yield.',
    },
    {
      id: 'CN-930412-Z',
      title: 'Graphene-based Battery Architecture with Solid State Electrolyte',
      description: 'Super-dense battery anode configuration with silicon-graphene hybrid whiskers suspended in static lithium salt matrix.',
      applicantName: 'NxtGen Power Corp.',
      applicantOrganization: 'NxtGen Power Corp.',
      filingDate: '2026-01-15',
      category: 'Energy Storage',
      status: 'Submitted',
      priority: 'Low',
      assignedOfficer: 'Unassigned',
      pendingDays: 145, // Red Delay alert - Red severity because over 90 days
      ipcClassification: 'H01M 10/0562; H01M 4/36',
      priorityDate: '2024-03-22',
      abstractSummary: 'A dynamic micro-bento composite layered mesh shielding dendritic breakthrough propagation during fast 10C charge states.',
    },
    {
      id: 'US-881234-B1',
      title: 'Automated Legal Document Analysis via Deep Semantic Transformer',
      description: 'Large language model fine-tuning architecture designed for multi-tier parsing of prior art documents and legal claims alignment checking.',
      applicantName: 'Juris AI Solutions',
      applicantOrganization: 'Juris AI Solutions',
      filingDate: '2026-05-09',
      category: 'Software / AI',
      status: 'Opposition Filed',
      priority: 'High',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 30, // Green/Yellow threshold
      ipcClassification: 'G06F 40/30; G06N 20/00',
      priorityDate: '2023-11-30',
      abstractSummary: 'A patent claims dependency tree cross-referencing validator built over transformer attention models mapping relative distance.',
    },
    {
      id: 'JP-772311-K',
      title: 'Optic Lens for Retinal Imaging Support Matrix',
      description: 'Microfabricated fluid lens with dynamic meniscus control for wide-angle scanning of human ophthalmic nerves.',
      applicantName: 'Kobe Optics Group',
      applicantOrganization: 'Kobe Optics Group',
      filingDate: '2026-04-11',
      category: 'Medical Device',
      status: 'Under Examination',
      priority: 'Medium',
      assignedOfficer: 'Dr. Helena Vance',
      pendingDays: 58, // Yellow Severity (>30 days)
      ipcClassification: 'A61B 3/12; G02B 3/14',
      priorityDate: '2024-02-14',
      abstractSummary: 'An automated piezoelectric actuator driving sub-micron fluid adjustments on medical ophthalmic scan loops.',
    },
  ];

  for (const c of patentCases) {
    await prisma.patentCase.create({ data: c });
  }
  console.log('Patent Cases seeded.');

  // 5. Create Oppositions
  const oppositions = [
    {
      id: 'OP-2023-9842',
      caseId: 'US-102948-B2',
      opponentName: 'TechGlobal Dynamics Inc.',
      reason: 'Lack of Novelty',
      detailedStatement: 'The claim around Reinforcement Learning-based dynamic superconducting calibration is fully anticipated by TechGlobal patent portfolio 442-A published in 2022. The applicant fails to clarify any inventive structural step beyond basic prior art loop controllers.',
      submissionDate: '2026-05-28',
      status: 'Pending',
      evidenceFiles: ['Prior_Art_Conflict_US442.pdf', 'Calibration_Bench_Analysis.xlsx'],
    },
    {
      id: 'OP-2023-8711',
      caseId: 'EP-485921-A1',
      opponentName: 'PharmaNexus Ltd.',
      reason: 'Lack of Inventive Step',
      detailedStatement: 'PharmaNexus presents scientific literature establishing that combining starch and lactic acids for suture filaments has been standard pharmaceutical procedure since 2018. The curing speed increase is merely an obvious escalation of temperature processing constraints.',
      submissionDate: '2026-05-30',
      status: 'Under Review',
      evidenceFiles: ['Suture_Review_PharmaNexus_2018.pdf'],
    },
    {
      id: 'OP-2023-7720',
      caseId: 'JP-772311-K',
      opponentName: 'Quantum Core Systems',
      reason: 'Insufficient Disclosure',
      detailedStatement: 'The patent description fails to details the fluid compound viscosity ratios needed to prevent optical aberration. A person skilled in the art is unable to reproduce the meniscus adjustments with the sparse documentation available.',
      submissionDate: '2026-06-01',
      status: 'Hearing Scheduled',
      evidenceFiles: ['Fluid_Dynamics_Aberration_Test.pdf'],
    },
    {
      id: 'OP-2023-6655',
      caseId: 'US-881234-B1',
      opponentName: 'Standard Materials Corp.',
      reason: 'Non-Patentable Subject Matter',
      detailedStatement: 'Under Section 3(k) of standard guidelines, pure computer software algorithmic structures without dedicated custom hardware structures are categorized as non-patentable subject matter. This applicant simply wraps standard transformers.',
      submissionDate: '2026-05-29',
      status: 'Under Review',
      evidenceFiles: ['Section_3k_Precedents.pdf'],
    },
    {
      id: 'OP-2024-0012',
      caseId: 'PAT-2024-0892',
      opponentName: 'Omni-Pharma Quantum Res.',
      reason: 'Lack of Inventive Step',
      detailedStatement: 'Constructing topographically braided logic gate arrangements lacks an inventive step over standard topological fault tolerance papers indexed in basic scientific review journals since early 2021.',
      submissionDate: '2026-06-03',
      status: 'Pending',
      evidenceFiles: ['Braiding_Topology_Notes.pdf'],
    },
    {
      id: 'OP-2024-0013',
      caseId: 'PAT-2024-0892',
      opponentName: 'Stellar Computing Corp.',
      reason: 'Prior Art Conflict (USPTO 11,293,12)',
      detailedStatement: 'Stellar Computing demonstrates that its active USPTO patent #11,293,12 covers topological error correction on superconducting arrays with identical entanglement patterns. Direct claims overlay is observed on Claim 1, 3, and 9.',
      submissionDate: '2026-06-04',
      status: 'Pending',
      evidenceFiles: ['USPTO_1129312_Active_Claims.pdf'],
    },
  ];

  for (const o of oppositions) {
    await prisma.opposition.create({ data: o });
  }
  console.log('Oppositions seeded.');

  // 6. Create Hearings
  const hearings = [
    {
      caseId: 'PAT-2024-0892',
      date: '2026-06-15',
      time: '11:00 AM',
      location: 'IPO Delhi - Courtroom 3B / Virtual Link',
      presidingOfficer: 'Dr. Helena Vance',
      status: 'Scheduled',
    },
    {
      caseId: 'JP-772311-K',
      date: '2026-06-22',
      time: '02:30 PM',
      location: 'Virtual Hearing Suite Alpha',
      presidingOfficer: 'Dr. Helena Vance',
      status: 'Scheduled',
    },
  ];

  for (const h of hearings) {
    await prisma.hearing.create({ data: h });
  }
  console.log('Hearings seeded.');

  // 7. Create Documents
  const documents = [
    {
      name: 'Patent_Specification_Main_v1.pdf',
      size: '4.8 MB',
      uploadedBy: 'Sarah Miller',
      category: 'Patent Application',
      caseId: 'PAT-2024-0892',
      status: 'Approved',
    },
    {
      name: 'Prior_Art_Conflict_US442.pdf',
      size: '1.2 MB',
      uploadedBy: 'Robert Chen',
      category: 'Prior Art',
      caseId: 'US-102948-B2',
      status: 'Approved',
    },
    {
      name: 'Calibration_Bench_Analysis.xlsx',
      size: '890 KB',
      uploadedBy: 'Robert Chen',
      category: 'Counter Statement',
      caseId: 'US-102948-B2',
      status: 'Pending Approval',
    },
    {
      name: 'Suture_Review_PharmaNexus_2018.pdf',
      size: '2.1 MB',
      uploadedBy: 'PharmaNexus Ltd.',
      category: 'Opposition Notice',
      caseId: 'EP-485921-A1',
      status: 'Approved',
    },
    {
      name: 'Hearing_Notice_PAT_0892.pdf',
      size: '450 KB',
      uploadedBy: 'Dr. Helena Vance',
      category: 'Hearing Notice',
      caseId: 'PAT-2024-0892',
      status: 'Approved',
    },
  ];

  for (const d of documents) {
    await prisma.document.create({ data: d });
  }
  console.log('Documents seeded.');

  // 8. Create Notifications
  const notifications = [
    {
      type: 'Delay Alert',
      title: 'Delhi HC Pre-Grant Threshold Escalation',
      description: 'Patent case PAT-2024-0892 has crossed 60 days in pending status. Action needed under recent Delhi HC transparency guidelines.',
      caseId: 'PAT-2024-0892',
      isRead: false,
      severity: 'error',
    },
    {
      type: 'New Opposition',
      title: 'New Dispute Lodged',
      description: 'Opponent Stellar Computing Corp. has filed a pre-grant opposition dispute OP-2024-0013 challenging topological claims.',
      caseId: 'PAT-2024-0892',
      isRead: false,
      severity: 'warning',
    },
    {
      type: 'Hearing Scheduled',
      title: 'Dispute Hearing Dispatched',
      description: 'Hearing scheduled for PAT-2024-0892 on 2026-06-15 at 11:00 AM by Dr. Helena Vance.',
      caseId: 'PAT-2024-0892',
      isRead: true,
      severity: 'info',
    },
  ];

  for (const n of notifications) {
    await prisma.systemNotification.create({ data: n });
  }
  console.log('Notifications seeded.');

  // 9. Create Delay Alerts (Matching Case Durations)
  const delayAlerts = [
    {
      caseId: 'CN-930412-Z',
      patentId: 'CN-930412-Z',
      title: 'High Delay Alert - Over 90 Days',
      pendingDays: 145,
      severity: 'Red',
      message: 'Filing processing backlog exceeded. Pending for 145 days. Immediate review required by Controller.',
    },
    {
      caseId: 'PAT-2024-0892',
      patentId: 'PAT-2024-0892',
      title: 'Threshold Breach Warning',
      pendingDays: 65,
      severity: 'Orange',
      message: 'Opposition interlock pending for 65 days. Close to maximum response deadline.',
    },
    {
      caseId: 'EP-485921-A1',
      patentId: 'EP-485921-A1',
      title: 'Compliance Warning',
      pendingDays: 45,
      severity: 'Yellow',
      message: 'Case in Examination for 45 days. Examination report pending dispatch.',
    },
  ];

  for (const da of delayAlerts) {
    await prisma.delayAlert.create({ data: da });
  }
  console.log('Delay Alerts seeded.');

  // 10. Audit Logs
  const auditLogs = [
    {
      userId: 'U-01',
      userName: 'Admin User',
      userRole: 'Admin',
      action: 'SYSTEM_SETTINGS_UPDATE',
      details: 'Strict Delhi HC Directive compliance rules set to ACTIVE.',
    },
    {
      userId: 'U-02',
      userName: 'Dr. Helena Vance',
      userRole: 'Patent Officer',
      action: 'HEARING_SCHEDULED',
      details: 'Scheduled dispute resolution hearing for Case PAT-2024-0892 on 2026-06-15.',
    },
    {
      userId: 'U-04',
      userName: 'Robert Chen',
      userRole: 'Opposition Party',
      action: 'OPPOSITION_FILED',
      details: 'Filed pre-grant opposition OP-2023-9842 against patent US-102948-B2.',
    },
  ];

  for (const al of auditLogs) {
    await prisma.auditLog.create({ data: al });
  }
  console.log('Audit Logs seeded.');

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
