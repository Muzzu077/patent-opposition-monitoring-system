import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import prisma from './prisma';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'poms_jwt_secret_token_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// Set up file upload destination for evidence documents
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

// Authentication Middleware
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}

// Audit Logging helper
async function logAudit(userId: string, userName: string, userRole: string, action: string, details: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        userRole,
        action,
        details,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

// Dynamic Delay Detection Engine
async function runDelayEngine() {
  try {
    const cases = await prisma.patentCase.findMany({
      where: {
        status: {
          notIn: ['Approved', 'Rejected']
        }
      }
    });

    const today = new Date();

    for (const c of cases) {
      const filingDate = new Date(c.filingDate);
      const diffTime = today.getTime() - filingDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

      // Update pending days in DB if changed
      if (diffDays !== c.pendingDays) {
        await prisma.patentCase.update({
          where: { id: c.id },
          data: { pendingDays: diffDays }
        });
      }

      // If case has been pending > 30 days, trigger delay warnings
      if (diffDays > 30) {
        let severity: 'Yellow' | 'Orange' | 'Red' = 'Yellow';
        if (diffDays > 90) severity = 'Red';
        else if (diffDays > 60) severity = 'Orange';

        const alertMessage = `Filing pending for ${diffDays} days under status '${c.status}'. Immediate evaluation required.`;

        // Check if delay alert already logged
        const existingAlert = await prisma.delayAlert.findFirst({
          where: { caseId: c.id }
        });

        if (!existingAlert) {
          // Create alert
          await prisma.delayAlert.create({
            data: {
              caseId: c.id,
              patentId: c.id,
              title: `Compliance Breach: ${severity} Severity`,
              pendingDays: diffDays,
              severity,
              message: alertMessage
            }
          });

          // Trigger System Notification
          await prisma.systemNotification.create({
            data: {
              type: 'Delay Alert',
              title: `Delay warning triggered - ${c.id}`,
              description: `Case has been pending for ${diffDays} days. Priority level: ${c.priority}.`,
              caseId: c.id,
              severity: severity === 'Red' ? 'error' : 'warning',
              timestamp: new Date()
            }
          });
        } else if (existingAlert.pendingDays !== diffDays || existingAlert.severity !== severity) {
          // Update alert
          await prisma.delayAlert.update({
            where: { id: existingAlert.id },
            data: {
              pendingDays: diffDays,
              severity,
              message: alertMessage
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error running Delay Detection Engine:', error);
  }
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Run delay engine check on incoming requests optionally
app.use(async (req, res, next) => {
  if (req.method === 'GET' && (req.path.startsWith('/api/cases') || req.path.startsWith('/api/analytics'))) {
    await runDelayEngine();
  }
  next();
});

// Authentication System
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, roleName, organization, avatarUrl } = req.body;

  if (!name || !email || !password || !roleName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const roleMap: Record<string, string> = {
      'Admin': 'ADMIN',
      'Patent Officer': 'OFFICER',
      'Applicant': 'APPLICANT',
      'Opposition Party': 'OPPONENT'
    };

    const roleId = roleMap[roleName] || 'APPLICANT';

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        roleId,
        organization,
        avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      },
      include: {
        role: true
      }
    });

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit(newUser.id, newUser.name, newUser.role.name as any, 'USER_REGISTERED', `User account ${newUser.email} registered successfully.`);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name,
        organization: newUser.organization,
        avatarUrl: newUser.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logAudit(user.id, user.name, user.role.name as any, 'USER_LOGIN', `Logged in from IP/Session.`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        organization: user.organization,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login server error' });
  }
});

// Patent Cases
app.get('/api/cases', async (req, res) => {
  const { search, category, status } = req.query;

  try {
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { id: { contains: String(search), mode: 'insensitive' } },
        { title: { contains: String(search), mode: 'insensitive' } },
        { applicantName: { contains: String(search), mode: 'insensitive' } },
        { applicantOrganization: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.category = String(category);
    }

    if (status) {
      whereClause.status = String(status);
    }

    const cases = await prisma.patentCase.findMany({
      where: whereClause,
      include: {
        oppositions: true,
        documents: true,
        hearings: true
      },
      orderBy: { filingDate: 'desc' }
    });

    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cases/:id', async (req, res) => {
  try {
    const patentCase = await prisma.patentCase.findUnique({
      where: { id: req.params.id },
      include: {
        oppositions: true,
        documents: true,
        hearings: true
      }
    });

    if (!patentCase) {
      return res.status(404).json({ error: 'Patent case not found' });
    }

    res.json(patentCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cases', authenticateToken, async (req: any, res) => {
  const { id, title, description, applicantName, applicantOrganization, filingDate, category, priority, assignedOfficer, ipcClassification, priorityDate, abstractSummary } = req.body;

  if (!id || !title || !applicantName || !applicantOrganization) {
    return res.status(400).json({ error: 'Required fields: id, title, applicantName, applicantOrganization' });
  }

  try {
    const newCase = await prisma.patentCase.create({
      data: {
        id,
        title,
        description: description || '',
        applicantName,
        applicantOrganization,
        filingDate: filingDate || new Date().toISOString().split('T')[0],
        category: category || 'General',
        status: 'Submitted',
        priority: priority || 'Medium',
        assignedOfficer: assignedOfficer || 'Unassigned',
        pendingDays: 0,
        ipcClassification: ipcClassification || 'A01B 1/00',
        priorityDate: priorityDate || filingDate || new Date().toISOString().split('T')[0],
        abstractSummary: abstractSummary || description || ''
      }
    });

    // Log Document Application PDF placeholder
    await prisma.document.create({
      data: {
        name: `Application_${id}.pdf`,
        size: '1.5 MB',
        uploadedBy: req.user.name,
        category: 'Patent Application',
        caseId: id,
        status: 'Approved'
      }
    });

    await prisma.systemNotification.create({
      data: {
        type: 'Deadline Approaching',
        title: 'New Register Submitted',
        description: `Patent case '${title}' successfully logged in POMS under ID ${id}.`,
        caseId: id,
        severity: 'info'
      }
    });

    await logAudit(req.user.id, req.user.name, req.user.role, 'CREATE_CASE', `Registered case ${id}: ${title}`);

    res.status(201).json(newCase);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cases/:id', authenticateToken, async (req: any, res) => {
  try {
    const currentCase = await prisma.patentCase.findUnique({ where: { id: req.params.id } });
    if (!currentCase) {
      return res.status(404).json({ error: 'Patent case not found' });
    }

    const updated = await prisma.patentCase.update({
      where: { id: req.params.id },
      data: req.body
    });

    // Create system notification if status changed
    if (req.body.status && req.body.status !== currentCase.status) {
      let notifyType: any = 'Deadline Approaching';
      if (req.body.status === 'Hearing Scheduled') notifyType = 'Hearing Scheduled';
      else if (req.body.status === 'Approved' || req.body.status === 'Rejected') notifyType = 'Decision Published';

      await prisma.systemNotification.create({
        data: {
          type: notifyType,
          title: `Status Update - ${updated.id}`,
          description: `Patent status changed from ${currentCase.status} to ${updated.status}.`,
          caseId: updated.id,
          severity: 'info'
        }
      });

      // If decision is approved/rejected, clear the delay alerts
      if (['Approved', 'Rejected'].includes(updated.status)) {
        await prisma.delayAlert.deleteMany({ where: { caseId: updated.id } });
      }
    }

    await logAudit(req.user.id, req.user.name, req.user.role, 'UPDATE_CASE', `Updated case fields on ${req.params.id}. Status set to: ${updated.status}`);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cases/:id', authenticateToken, async (req: any, res) => {
  try {
    await prisma.patentCase.delete({ where: { id: req.params.id } });
    await logAudit(req.user.id, req.user.name, req.user.role, 'DELETE_CASE', `Deleted case ID ${req.params.id}`);
    res.json({ message: 'Patent case deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Oppositions
app.get('/api/oppositions', async (req, res) => {
  try {
    const list = await prisma.opposition.findMany({
      include: { patentCase: true },
      orderBy: { submissionDate: 'desc' }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/oppositions', authenticateToken, upload.array('evidence'), async (req: any, res) => {
  const { caseId, opponentName, reason, detailedStatement, evidenceFiles } = req.body;

  if (!caseId || !opponentName || !reason || !detailedStatement) {
    return res.status(400).json({ error: 'All opposition fields are required' });
  }

  try {
    const targetCase = await prisma.patentCase.findUnique({ where: { id: caseId } });
    if (!targetCase) {
      return res.status(404).json({ error: 'Patent case not found' });
    }

    const opId = `OP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const filesArray = evidenceFiles ? JSON.parse(evidenceFiles) : (req.files as any[])?.map(f => f.filename) || [];

    const newOpposition = await prisma.opposition.create({
      data: {
        id: opId,
        caseId,
        opponentName,
        reason,
        detailedStatement,
        submissionDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        evidenceFiles: filesArray
      }
    });

    // Update case status
    await prisma.patentCase.update({
      where: { id: caseId },
      data: {
        status: 'Opposition Filed',
        pendingDays: Math.max(31, targetCase.pendingDays) // force breach trigger threshold
      }
    });

    // Add document reference
    for (const f of filesArray) {
      await prisma.document.create({
        data: {
          name: f,
          size: '2.4 MB',
          uploadedBy: req.user.name,
          category: 'Opposition Notice',
          caseId,
          status: 'Pending Approval'
        }
      });
    }

    // Trigger Notification
    await prisma.systemNotification.create({
      data: {
        type: 'New Opposition',
        title: `Opposition registered on ${caseId}`,
        description: `Dispute filed by ${opponentName} citing ${reason}.`,
        caseId,
        severity: 'warning'
      }
    });

    await logAudit(req.user.id, req.user.name, req.user.role, 'FILE_OPPOSITION', `Filed opposition ${opId} on case ${caseId}`);

    res.status(201).json(newOpposition);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/oppositions/:id', authenticateToken, async (req: any, res) => {
  try {
    const op = await prisma.opposition.findUnique({ where: { id: req.params.id } });
    if (!op) return res.status(404).json({ error: 'Opposition not found' });

    const updated = await prisma.opposition.update({
      where: { id: req.params.id },
      data: req.body
    });

    await logAudit(req.user.id, req.user.name, req.user.role, 'UPDATE_OPPOSITION', `Opposition ${req.params.id} status set to ${updated.status}`);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await prisma.systemNotification.findMany({
      orderBy: { timestamp: 'desc' }
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notifications as read
app.post('/api/notifications/read', async (req, res) => {
  try {
    await prisma.systemNotification.updateMany({
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    await prisma.systemNotification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// System Settings
app.get('/api/settings', async (req, res) => {
  // Return standard settings
  res.json({
    maxExaminationDays: 30,
    maxOppositionResponseDays: 45,
    enableEmailAlerts: true,
    enableAutoEscalation: true,
    strictHCDirectiveRules: true
  });
});

// Dashboard Analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const totalCases = await prisma.patentCase.count();
    const pendingCases = await prisma.patentCase.count({
      where: { status: { notIn: ['Approved', 'Rejected'] } }
    });
    const delayedCases = await prisma.patentCase.count({
      where: {
        pendingDays: { gt: 60 },
        status: { notIn: ['Approved', 'Rejected'] }
      }
    });
    const completedCases = await prisma.patentCase.count({
      where: { status: { in: ['Approved', 'Rejected'] } }
    });

    const activeAlerts = await prisma.delayAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const recentCases = await prisma.patentCase.findMany({
      orderBy: { filingDate: 'desc' },
      take: 5
    });

    const upcomingHearings = await prisma.hearing.findMany({
      where: { status: 'Scheduled' },
      orderBy: { date: 'asc' },
      take: 5
    });

    const cases = await prisma.patentCase.findMany();
    const oppositions = await prisma.opposition.findMany();

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    res.json({
      stats: {
        totalCases,
        pendingCases,
        delayedCases,
        completedCases
      },
      activeAlerts,
      recentCases,
      upcomingHearings,
      auditLogs,
      cases,
      oppositions
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reports Analytics
app.get('/api/analytics/reports', async (req, res) => {
  try {
    const cases = await prisma.patentCase.findMany();
    const oppositions = await prisma.opposition.findMany();

    // Calculate categories breakdown
    const categoryCounts: Record<string, number> = {};
    const delayByStatus: Record<string, number> = {};

    cases.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      if (c.pendingDays > 30) {
        delayByStatus[c.status] = (delayByStatus[c.status] || 0) + 1;
      }
    });

    // Mock Officer stats based on database seed
    const officerPerformance = [
      { name: 'Dr. Helena Vance', casesAssigned: 5, resolvedCount: 3, pendingCount: 2, avgResponseDays: 32 },
      { name: 'Unassigned', casesAssigned: 1, resolvedCount: 0, pendingCount: 1, avgResponseDays: 145 }
    ];

    res.json({
      categoryCounts,
      delayByStatus,
      officerPerformance,
      totalCases: cases.length,
      totalOppositions: oppositions.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build output in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export app for testing
export default app;

// Start Server if not in testing mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`POMS API backend listening on port ${PORT}`);
  });
}
