import { PrismaClient, Role, SubmissionStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/auth-utils';

const prisma = new PrismaClient();

const departments = [
  {
    name: "College of Allied Health Studies (CAHS)",
    programs: ["BS in Nursing", "BS in Midwifery"]
  },
  {
    name: "College of Business and Accountancy (CBA)",
    programs: [
      "BS in Accountancy",
      "BS in Business Administration Major in Financial Management",
      "BS in Business Administration Major in Human Resource Management",
      "BS in Business Administration Major in Marketing Management",
      "BS in Customs Administration"
    ]
  },
  {
    name: "College of Computer Studies (CCS)",
    programs: [
      "BS in Computer Science",
      "BS in Entertainment and Multimedia Computing",
      "BS in Information Technology"
    ]
  },
  {
    name: "College of Education, Arts, and Sciences (CEAS)",
    programs: [
      "BA in Communication",
      "BS in Early Childhood Education",
      "BS in Culture and Arts Education",
      "BS in Physical Education",
      "BS in Elementary Education (General Education)",
      "BS in Secondary Education major in English",
      "BS in Secondary Education major in Filipino",
      "BS in Secondary Education major in Mathematics",
      "BS in Secondary Education major in Social Studies",
      "BS in Secondary Education major in Sciences"
    ]
  },
  {
    name: "College of Hospitality and Tourism Management (CHTM)",
    programs: [
      "BS in Hospitality Management",
      "BS in Tourism Management"
    ]
  }
];

const statuses = ["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"] as const;

async function generateRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateRandomStudent(index: number) {
  const department = departments[Math.floor(Math.random() * departments.length)];
  const program = department.programs[Math.floor(Math.random() * department.programs.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const createdAt = await generateRandomDate(new Date(2023, 0, 1), new Date());
  
  return {
    name: `Student ${index}`,
    email: `student${index}@example.com`,
    password: await hashPassword("Password123!"),
    role: Role.STUDENT,
    emailVerified: new Date(),
    studentProfile: {
      create: {
        studentId: `2023${String(index).padStart(4, '0')}`,
        department: department.name,
        program: program,
        psaStatus: status as SubmissionStatus,
        awardStatus: status as SubmissionStatus,
        overallStatus: status as SubmissionStatus,
        dob: `${1995 + Math.floor(Math.random() * 10)}-01-01`,
        pob: "Olongapo City, Philippines",
        createdAt: createdAt,
        updatedAt: createdAt,
        psaS3Key: `dummy-psa-key-${index}`,
        gradPhotoS3Key: `dummy-grad-photo-key-${index}`
      }
    }
  };
}

async function generateRandomAdmin(index: number) {
  return {
    name: `Admin ${index}`,
    email: `admin${index}@example.com`,
    password: await hashPassword("Password123!"),
    role: Role.ADMIN,
    emailVerified: new Date()
  };
}

async function generateRandomFaculty(index: number) {
  return {
    name: `Faculty ${index}`,
    email: `faculty${index}@example.com`,
    password: await hashPassword("Password123!"),
    role: Role.FACULTY,
    emailVerified: new Date()
  };
}

async function generateAuditLogs(users: any[]) {
  const actions = [
    "LOGIN",
    "PROFILE_UPDATE",
    "VERIFICATION_SUBMIT",
    "VERIFICATION_APPROVED",
    "VERIFICATION_REJECTED"
  ];

  const logs = [];
  for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const createdAt = await generateRandomDate(new Date(2023, 0, 1), new Date());

    logs.push({
      action,
      userId: user.id,
      targetId: user.id,
      details: {
        action,
        timestamp: createdAt
      },
      createdAt
    });
  }

  return logs;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Remove all existing data
  await prisma.auditLog.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create admins
  const adminData = await Promise.all(Array.from({ length: 3 }, (_, i) => generateRandomAdmin(i + 1)));
  const admins = await Promise.all(adminData.map(admin => prisma.user.create({ data: admin })));

  console.log('✅ Created admins');

  // Create faculty
  const facultyData = await Promise.all(Array.from({ length: 5 }, (_, i) => generateRandomFaculty(i + 1)));
  const faculty = await Promise.all(facultyData.map(faculty => prisma.user.create({ data: faculty })));

  console.log('✅ Created faculty');

  // Create students with profiles
  const studentData = await Promise.all(Array.from({ length: 50 }, (_, i) => generateRandomStudent(i + 1)));
  const students = await Promise.all(studentData.map(student => prisma.user.create({ 
    data: student,
    include: { studentProfile: true }
  })));

  console.log('✅ Created students with profiles');

  // Create audit logs
  const allUsers = [...admins, ...faculty, ...students];
  const auditLogs = await Promise.all(
    (await generateAuditLogs(allUsers))
      .map(log => prisma.auditLog.create({ data: log }))
  );

  console.log('✅ Created audit logs');

  // Integrity check: find orphaned student profiles (raw SQL)
  const orphanedProfiles: any[] = await prisma.$queryRaw`
    SELECT "id" FROM "StudentProfile"
    WHERE "userId" NOT IN (SELECT "id" FROM "User")
  `;
  if (orphanedProfiles.length > 0) {
    console.warn('❌ Orphaned StudentProfiles found:', orphanedProfiles.map((p: any) => p.id));
  } else {
    console.log('✅ All StudentProfiles are linked to a valid User.');
  }

  console.log('✨ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 