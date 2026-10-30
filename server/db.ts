import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  preferredLanguage: 'mr' | 'hi' | 'en';
  targetCategory: string; // 'school' | 'hsc' | 'college' | 'competitive'
  targetExam?: string;
  subscription: {
    plan: 'free' | 'trial' | 'premium';
    status: 'active' | 'expired';
    trialStartedAt?: string;
    trialExpiresAt?: string;
    premiumExpiresAt?: string;
    autoRenew: boolean;
  };
  bookmarks: {
    videos: string[];
    notes: string[];
  };
  progress: {
    completedVideos: string[];
    quizAttempts: Array<{
      id: string;
      quizId: string;
      quizTitle: string;
      score: number;
      total: number;
      percentage: number;
      date: string;
      timeSpentSeconds: number;
    }>;
  };
  streak: number;
  totalScore: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  icon: string;
  badge: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;
}

export interface Course {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  categoryId: string;
  grade: string;
  targetAudience: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;
  thumbnail: string;
  isPremium: boolean;
  instructor: string;
  rating: number;
  totalStudents: number;
  tags: string[];
  createdAt: string;
}

export interface VideoLecture {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  youtubeUrl: string;
  youtubeId: string;
  duration: string;
  order: number;
  isPremium: boolean;
  chapterName: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
}

export interface PDFNote {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  pages: number;
  size: string;
  isPremium: boolean;
  chapterName: string;
  downloadUrl: string;
  contentMarkdown: string; // rich content for in-app reader if direct pdf is previewed
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  questionMr: string;
  optionsEn: string[];
  optionsHi: string[];
  optionsMr: string[];
  correctAnswer: number; // 0-indexed
  explanationEn: string;
  explanationHi: string;
  explanationMr: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  timeMinutes: number;
  passingScore: number;
  isPremium: boolean;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number; // in INR
  currency: string;
  status: 'success' | 'failed' | 'pending';
  plan: 'monthly_premium';
  signature?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  courses: Course[];
  videos: VideoLecture[];
  notes: PDFNote[];
  quizzes: Quiz[];
  payments: PaymentRecord[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export function hashPassword(password: string): string {
  const salt = 'moti_study_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

function getInitialData(): DatabaseSchema {
  const adminPasswordHash = hashPassword('Admin@123');
  const studentPasswordHash = hashPassword('Student@123');

  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 'usr_owner_admin',
      name: 'Owner Admin',
      email: 'aarthak21@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      preferredLanguage: 'mr',
      targetCategory: 'competitive',
      targetExam: 'MPSC State Services',
      subscription: {
        plan: 'premium',
        status: 'active',
        premiumExpiresAt: '2099-12-31T23:59:59.000Z',
        autoRenew: true,
      },
      bookmarks: { videos: [], notes: [] },
      progress: { completedVideos: [], quizAttempts: [] },
      streak: 15,
      totalScore: 950,
      lastActiveDate: now,
      createdAt: now,
    },
    {
      id: 'usr_demo_student',
      name: 'Rahul Deshmukh',
      email: 'student@motistudy.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      preferredLanguage: 'mr',
      targetCategory: 'competitive',
      targetExam: 'MPSC & Police Bharti',
      subscription: {
        plan: 'trial',
        status: 'active',
        trialStartedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        trialExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: false,
      },
      bookmarks: { videos: ['vid_mpsc_01', 'vid_math_01'], notes: ['not_mpsc_01'] },
      progress: {
        completedVideos: ['vid_mpsc_01'],
        quizAttempts: [
          {
            id: 'qa_01',
            quizId: 'quiz_mpsc_01',
            quizTitle: 'महाराष्ट्र भूगोल व इतिहास (Maharashtra GK)',
            score: 4,
            total: 5,
            percentage: 80,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            timeSpentSeconds: 165,
          },
        ],
      },
      streak: 6,
      totalScore: 420,
      lastActiveDate: now,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'usr_priya_sharma',
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      preferredLanguage: 'hi',
      targetCategory: 'hsc',
      targetExam: '12th Science & MHT-CET',
      subscription: {
        plan: 'premium',
        status: 'active',
        premiumExpiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
      },
      bookmarks: { videos: ['vid_phys_01'], notes: ['not_phys_01'] },
      progress: {
        completedVideos: ['vid_phys_01', 'vid_math_01'],
        quizAttempts: [
          {
            id: 'qa_02',
            quizId: 'quiz_phys_01',
            quizTitle: 'Physics: Rotational Dynamics & Gravitation',
            score: 5,
            total: 5,
            percentage: 100,
            date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            timeSpentSeconds: 140,
          },
        ],
      },
      streak: 9,
      totalScore: 580,
      lastActiveDate: now,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'usr_aniket_patil',
      name: 'Aniket Patil',
      email: 'aniket.patil@example.com',
      passwordHash: studentPasswordHash,
      role: 'student',
      preferredLanguage: 'en',
      targetCategory: 'college',
      targetExam: 'B.Tech Computer Engineering',
      subscription: {
        plan: 'free',
        status: 'active',
        autoRenew: false,
      },
      bookmarks: { videos: [], notes: [] },
      progress: {
        completedVideos: ['vid_py_01'],
        quizAttempts: [
          {
            id: 'qa_03',
            quizId: 'quiz_py_01',
            quizTitle: 'Python & Data Structures Mastery Quiz',
            score: 4,
            total: 5,
            percentage: 80,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            timeSpentSeconds: 190,
          },
        ],
      },
      streak: 3,
      totalScore: 310,
      lastActiveDate: now,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const categories: Category[] = [
    {
      id: 'competitive',
      nameEn: 'Competitive Exams',
      nameHi: 'प्रतियोगी परीक्षा',
      nameMr: 'स्पर्धा परीक्षा',
      icon: 'Award',
      badge: 'MPSC, Police, UPSC',
      descriptionEn: 'MPSC Rajyaseva, Combine, Police Bharti, Talathi Bharti, Banking & SSC.',
      descriptionHi: 'एमपीएससी, पुलिस भर्ती, तलाठी, एसएससी और बैंकिंग की संपूर्ण तैयारी।',
      descriptionMr: 'एमपीएससी राज्यसेवा, गट ब/क संयुक्त, पोलीस भरती, तलाठी व सरळसेवा भरती तयारी.',
    },
    {
      id: 'hsc',
      nameEn: '11th & 12th Standard',
      nameHi: '11वीं और 12वीं कक्षा',
      nameMr: '११ वी आणि १२ वी',
      icon: 'GraduationCap',
      badge: 'HSC & CET / NEET',
      descriptionEn: 'Science, Commerce, Arts (Maharashtra State Board HSC, MHT-CET & JEE/NEET basics).',
      descriptionHi: 'महाराष्ट्र बोर्ड 11वीं और 12वीं विज्ञान, वाणिज्य व कला संकाय।',
      descriptionMr: 'महाराष्ट्र राज्य मंडळ १२ वी सायन्स, कॉमर्स आणि आर्ट्स सह सीईटी मार्गदर्शन.',
    },
    {
      id: 'school',
      nameEn: 'School Students (5th - 10th)',
      nameHi: 'स्कूली छात्र (कक्षा 5 - 10)',
      nameMr: 'शालेय शिक्षण (इ. ५ वी ते १० वी)',
      icon: 'BookOpen',
      badge: 'SSC & CBSE',
      descriptionEn: 'Class 8th, 9th & 10th SSC Board Marathi & English medium core concepts.',
      descriptionHi: 'कक्षा 5 से 10वीं तक गणित, विज्ञान व सामाजिक शास्त्र की मजबूत नींव।',
      descriptionMr: 'इयत्ता ५ वी ते १० वी गणित, विज्ञान, इंग्रजी व सामाजिक शास्त्रे सुलभ मार्गदर्शन.',
    },
    {
      id: 'college',
      nameEn: 'College & Professional',
      nameHi: 'कॉलेज और व्यावसायिक कौशल',
      nameMr: 'महाविद्यालय व कौशल्ये',
      icon: 'Briefcase',
      badge: 'Engineering, BCA, Skills',
      descriptionEn: 'Programming, Computer Science, Soft Skills, Data Structures & Placement prep.',
      descriptionHi: 'पायथन कोडिंग, कंप्यूटर साइंस और प्लेसमेंट रेडी कौशल।',
      descriptionMr: 'पायथन प्रोग्रामिंग, सॉफ्ट स्किल्स आणि कॉलेज परीक्षा तयारी.',
    },
  ];

  const courses: Course[] = [
    {
      id: 'crs_mpsc_01',
      titleEn: 'MPSC & Police Bharti: Maharashtra General Knowledge & History',
      titleHi: 'एमपीएससी और पुलिस भर्ती: महाराष्ट्र सामान्य ज्ञान और इतिहास',
      titleMr: 'एमपीएससी व पोलीस भरती: संपूर्ण महाराष्ट्र भूगोल, इतिहास व पंचायतराज',
      categoryId: 'competitive',
      grade: 'Competitive',
      targetAudience: 'MPSC, Police Bharti, Talathi aspirants',
      descriptionEn: 'Comprehensive preparation for Maharashtra competitive examinations covering geography, modern history, and administrative structures with memory tricks and past-year analysis.',
      descriptionHi: 'महाराष्ट्र की सभी प्रतियोगी परीक्षाओं के लिए भूगोल, इतिहास और पंचायती राज का विस्तृत अध्ययन।',
      descriptionMr: 'स्पर्धा परीक्षांसाठी अत्यावश्यक महाराष्ट्र विशेष सामान्य अध्ययन, नकाशे, महत्त्वाच्या घटना व मागील वर्षांतील प्रश्नपत्रिका विश्लेषण.',
      thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      isPremium: false,
      instructor: 'प्रा. सचिन कदम (Sachin Kadam)',
      rating: 4.9,
      totalStudents: 3420,
      tags: ['MPSC', 'Police Bharti', 'Maharashtra GK', 'History'],
      createdAt: now,
    },
    {
      id: 'crs_math_10th',
      titleEn: 'Class 10 SSC Mathematics: Complete Concept & Practice',
      titleHi: '10वीं कक्षा गणित: संपूर्ण संकल्पना व अभ्यास',
      titleMr: 'इयत्ता १० वी गणित भाग १ व २: परिपूर्ण संकल्पना व सूत्रे',
      categoryId: 'school',
      grade: 'Class 10th',
      targetAudience: '10th SSC State Board Students',
      descriptionEn: 'Master Linear Equations, Quadratic Equations, Geometry Circles, and Trigonometry with step-by-step solved examples and theorem proofs.',
      descriptionHi: '10वीं बोर्ड परीक्षा में 100/100 अंक प्राप्त करने के लिए संपूर्ण गणित की आसान व्याख्या।',
      descriptionMr: 'दहावी बोर्ड परीक्षेत गणितात पैकीच्या पैकी गुण मिळवण्यासाठी सर्व सरावसंच, प्रमेये व शॉर्ट ट्रिक्स.',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      isPremium: false,
      instructor: 'सौ. अनिता जोशी (Anita Joshi)',
      rating: 4.8,
      totalStudents: 2850,
      tags: ['Class 10', 'SSC Board', 'Maths 1 & 2', 'Algebra', 'Geometry'],
      createdAt: now,
    },
    {
      id: 'crs_phys_12th',
      titleEn: '12th HSC Physics Masterclass (Boards & MHT-CET)',
      titleHi: '12वीं भौतिकी मास्टरक्लास (बोर्ड व एमएचटी-सीईटी)',
      titleMr: '१२ वी भौतिकशास्त्र (Physics) संपूर्ण तयारी व MHT-CET',
      categoryId: 'hsc',
      grade: 'Class 12th',
      targetAudience: '12th Science HSC & CET Aspirants',
      descriptionEn: 'Deep dive into Rotational Dynamics, Mechanical Properties of Fluids, Thermodynamics, and Wave Optics with numerical problem solving.',
      descriptionHi: '12वीं फिजिक्स के सभी चैप्टर्स के डेरिवेशन, फॉर्मूला शीट्स और न्यूमेरिकल्स का सटीक हल।',
      descriptionMr: 'रोटेशनल डायनॅमिक्स, वेव्ह ऑप्टिक्स व मॉडर्न फिजिक्स यांसारख्या अवघड घटकांची सोप्या भाषेत मांडणी.',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
      isPremium: true,
      instructor: 'डॉ. रमेश माने (Dr. Ramesh Mane)',
      rating: 4.95,
      totalStudents: 1940,
      tags: ['12th Science', 'HSC Physics', 'MHT-CET', 'Numericals'],
      createdAt: now,
    },
    {
      id: 'crs_mpsc_marathi_vyakaran',
      titleEn: 'Superfast Marathi Grammar (मराठी व्याकरण) for All Exams',
      titleHi: 'संपूर्ण मराठी व्याकरण - सभी प्रतियोगी परीक्षाओं के लिए',
      titleMr: 'संपूर्ण परिपूर्ण मराठी व्याकरण: वर्णविचार ते वाक्यरूपांतर',
      categoryId: 'competitive',
      grade: 'Competitive',
      targetAudience: 'Police Bharti, MPSC, Saral Seva',
      descriptionEn: 'Score 100% in Marathi language paper with conceptual clarity on Sandhi, Samas, Prayog, Alankar and vocabulary.',
      descriptionHi: 'मराठी व्याकरण के सभी नियम, समास, प्रयोग और अलंकार उदाहरण सहित सीखें।',
      descriptionMr: 'वर्णमाला, संधी, नाम, सर्वनाम, प्रयोग, समास, अलंकार व म्हणींचा परिपूर्ण सराव.',
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      isPremium: true,
      instructor: 'श्री. बाळकृष्ण शिंदे (B. Shinde)',
      rating: 4.9,
      totalStudents: 4100,
      tags: ['मराठी व्याकरण', 'Police Bharti', 'MPSC Combine', 'Talathi'],
      createdAt: now,
    },
    {
      id: 'crs_college_python',
      titleEn: 'Python Programming & DSA for College Students',
      titleHi: 'कॉलेज छात्रों के लिए पायथन और डेटा स्ट्रक्चर्स',
      titleMr: 'कॉलेज विद्यार्थ्यांसाठी पायथन प्रोग्रामिंग व डेटा स्ट्रक्चर्स',
      categoryId: 'college',
      grade: 'Undergraduate',
      targetAudience: 'Engineering, BCA, BSc IT students',
      descriptionEn: 'From core Python syntax to Object Oriented Programming, recursion, linked lists, stacks, and interview coding challenges.',
      descriptionHi: 'प्रोग्रामिंग की शुरुआत से लेकर कोडिंग इंटरव्यू और प्लेसमेंट की तैयारी तक।',
      descriptionMr: 'सॉफ्टवेअर इंडस्ट्रीसाठी लागणारे कोडिंग ज्ञान, अल्गोरिदम आणि प्रत्यक्ष प्रोजेक्ट निर्मिती.',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
      isPremium: false,
      instructor: 'इंजि. रोहन कुलकर्णी (Rohan Kulkarni)',
      rating: 4.85,
      totalStudents: 1670,
      tags: ['Python', 'DSA', 'Coding', 'College', 'Placement'],
      createdAt: now,
    },
  ];

  const videos: VideoLecture[] = [
    {
      id: 'vid_mpsc_01',
      courseId: 'crs_mpsc_01',
      titleEn: 'Maharashtra Geography: Rivers, Godavari & Sahyadri Ranges',
      titleHi: 'महाराष्ट्र का भूगोल: नदियां, गोदावरी और सह्याद्रि पर्वतमाला',
      titleMr: 'महाराष्ट्राचा भूगोल: सह्याद्री पर्वत व प्रमुख नद्या (गोदावरी, भीमा, कृष्णा)',
      youtubeUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
      youtubeId: 'kqtD5dpn9C8',
      duration: '24:15',
      order: 1,
      isPremium: false,
      chapterName: 'प्रकरण १: प्राकृतिक भूगोल',
      summaryEn: 'Detailed breakdown of Western Ghats (Sahyadri), peak heights like Kalsubai, river systems, and drainage patterns.',
      summaryHi: 'सह्याद्रि पर्वत श्रृंखला, कलसुबाई शिखर और प्रमुख नदी प्रणालियों का मानचित्र के साथ अध्ययन।',
      summaryMr: 'सह्याद्रीच्या प्रमुख रांगा, घाटरस्ते, कळसूबाई शिखर आणि गोदावरी नदीचे खोरे यावरील सखोल विश्लेषण.',
    },
    {
      id: 'vid_mpsc_02',
      courseId: 'crs_mpsc_01',
      titleEn: 'Panchayat Raj & 73rd/74th Constitutional Amendments',
      titleHi: 'पंचायती राज और 73वां/74वां संविधान संशोधन',
      titleMr: 'पंचायत राज व्यवस्था: ग्रामपंचायत, पंचायत समिती व जिल्हा परिषद',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      duration: '31:40',
      order: 2,
      isPremium: true,
      chapterName: 'प्रकरण २: स्थानिक स्वराज्य संस्था',
      summaryEn: 'Structure of 3-tier local self-governance in Maharashtra, roles of Gram Sevak, BDO, and CEO.',
      summaryHi: 'महाराष्ट्र में त्रिस्तरीय पंचायती राज व्यवस्था, वित्तीय अधिकार और मुख्य संवैधानिक प्रावधान।',
      summaryMr: 'त्रिस्तरीय पंचायत राज, वसंतराव नाईक समितीच्या शिफारशी, कलम २४३ आणि सरपंचांचे अधिकार.',
    },
    {
      id: 'vid_math_01',
      courseId: 'crs_math_10th',
      titleEn: 'Linear Equations in Two Variables: Graphical Method & Cramer Rule',
      titleHi: 'दो चरों वाले रैखिक समीकरण: आलेखीय विधि और क्रैमर नियम',
      titleMr: 'दोन चलांमधील रेषीय समीकरणे: क्रेमरची पद्धत व आलेख पद्धती',
      youtubeUrl: 'https://www.youtube.com/watch?v=yYkK4aF_2n4',
      youtubeId: 'yYkK4aF_2n4',
      duration: '19:50',
      order: 1,
      isPremium: false,
      chapterName: 'प्रकरण १: दोन चलांमधील रेषीय समीकरणे',
      summaryEn: 'Understand Determinants, Cramer rule formula D, Dx, Dy, and step-by-step solving for SSC Board.',
      summaryHi: 'निश्चयक (Determinant) और क्रैमर का नियम समझें और बोर्ड परीक्षा के प्रश्नों को हल करें।',
      summaryMr: 'निश्चयकाची किंमत काढणे, क्रेमरची पद्धत (D, Dx, Dy) आणि १० वी बोर्डाच्या संभाव्य प्रश्नांची सोडवणूक.',
    },
    {
      id: 'vid_math_02',
      courseId: 'crs_math_10th',
      titleEn: 'Quadratic Equations: Factorization & Formula Method Tricks',
      titleHi: 'द्विघात समीकरण: गुणनखंड और सूत्र विधि',
      titleMr: 'वर्गसमीकरणे: अवयव पद्धत व सूत्र पद्धतीची अचूक उकल',
      youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      youtubeId: 'fJ9rUzIMcZQ',
      duration: '22:15',
      order: 2,
      isPremium: true,
      chapterName: 'प्रकरण २: वर्गसमीकरणे',
      summaryEn: 'Derivation of quadratic formula x = (-b ± √(b² - 4ac)) / 2a with nature of roots discriminant delta.',
      summaryHi: 'विवेचक (Δ = b² - 4ac) और मूलों के लक्षण पर आधारित महत्वपूर्ण प्रश्न।',
      summaryMr: 'डेल्टाचे स्वरूप (वास्तव, समान, असमान), सूत्र पद्धत आणि शाब्दिक उदाहरणे कशी सोडवायची.',
    },
    {
      id: 'vid_phys_01',
      courseId: 'crs_phys_12th',
      titleEn: 'Rotational Dynamics: Centripetal Force, Banking of Roads',
      titleHi: 'घूर्णी गतिविज्ञान: अभिकेंद्रीय बल और सड़कों की बैंकिंग',
      titleMr: 'रोटेशनल डायनॅमिक्स: अभिकेंद्री बल, रस्त्याची वळणे (Banking of Roads)',
      youtubeUrl: 'https://www.youtube.com/watch?v=hB8a1_f1m5U',
      youtubeId: 'hB8a1_f1m5U',
      duration: '35:20',
      order: 1,
      isPremium: true,
      chapterName: 'Chapter 1: Rotational Dynamics',
      summaryEn: 'Formula derivation for optimum speed on banked curves: v = √(rg tan θ), conical pendulum time period.',
      summaryHi: 'बैंक की हुई सड़कों पर सुरक्षित गति की गणना और शंक्वाकार लोलक का आवर्तकाल।',
      summaryMr: 'रस्त्याची वळणे, कोनिकल पेंडुलमचे सूत्र आणि MHT-CET मधील न्यूमरिकल्स सोडवण्याच्या सोप्या क्लृप्त्या.',
    },
    {
      id: 'vid_marathi_01',
      courseId: 'crs_mpsc_marathi_vyakaran',
      titleEn: 'Prayog in Marathi: Kartari, Karmani & Bhave Prayog Explained',
      titleHi: 'मराठी में प्रयोग: कर्तरी, कर्मणी और भावे प्रयोग की पहचान',
      titleMr: 'प्रयोग विचार: कर्तरी, कर्मणी आणि भावे प्रयोगाची सहज ओळख',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeId: 'dQw4w9WgXcQ',
      duration: '28:10',
      order: 1,
      isPremium: true,
      chapterName: 'प्रकरण ३: प्रयोग विचार',
      summaryEn: 'How to instantly identify subject, object, verb agreements in 5 seconds with golden rules.',
      summaryHi: 'कर्ता, कर्म और क्रियापद के परस्पर संबंध को समझकर परीक्षा में सही उत्तर चुनें।',
      summaryMr: 'सकर्मक कर्तरी, अकर्मक कर्तरी, प्रधानकर्तृत्व कर्मणी व भावे प्रयोगाच्या अचूक ट्रिक्स.',
    },
    {
      id: 'vid_py_01',
      courseId: 'crs_college_python',
      titleEn: 'Python Fundamentals: Variables, Loops & Functions',
      titleHi: 'पायथन मूल बातें: वेरिएबल्स, लूप और फंक्शन्स',
      titleMr: 'पायथन बेसिक्स: व्हेरिएबल्स, लूप्स आणि फंक्शन्स',
      youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      youtubeId: '_uQrJ0TkZlc',
      duration: '26:45',
      order: 1,
      isPremium: false,
      chapterName: 'Unit 1: Introduction to Python',
      summaryEn: 'Hands-on programming with conditional statements, for/while loops, and modular code writing.',
      summaryHi: 'पायथन की आसान सिंटैक्स, इफ-एल्स, लूप्स और फंक्शन्स का प्रैक्टिकल कोड।',
      summaryMr: 'पायथन इन्स्टॉलेशन, व्हेरिएबल्स, लिस्ट्स आणि फंक्शन्सची प्रॅक्टिकल माहिती.',
    },
  ];

  const notes: PDFNote[] = [
    {
      id: 'not_mpsc_01',
      courseId: 'crs_mpsc_01',
      titleEn: 'Maharashtra Geography & Rivers Quick Revision Notes',
      titleHi: 'महाराष्ट्र भूगोल और नदियां त्वरित पुनरीक्षण नोट्स',
      titleMr: 'महाराष्ट्र भूगोल व नद्या - संपूर्ण उजळणी व तक्ते (PDF)',
      pages: 14,
      size: '2.4 MB',
      isPremium: false,
      chapterName: 'प्रकरण १: प्राकृतिक भूगोल',
      downloadUrl: '/api/notes/download/not_mpsc_01',
      contentMarkdown: `# महाराष्ट्र भूगोल: जलद उजळणी नोट्स (Moti Study Smart)

## १. सह्याद्री पर्वत आणि प्रमुख शिखरे
* **कळसूबाई शिखर**: १६४६ मीटर (अहमदनगर जिल्हा, अकोले तालुका). महाराष्ट्रातील सर्वोच्च शिखर!
* **साल्हेर शिखर**: १५६७ मीटर (नाशिक जिल्हा).
* **महाबळेश्वर**: १४३८ मीटर (सातारा जिल्हा).
* **हरिश्चंद्रगड**: १४२४ मीटर (अहमदनगर जिल्हा).

## २. प्रमुख नद्या व त्यांची खोरी
* **गोदावरी नदी**:
  - उगम: त्र्यंबकेश्वर (नाशिक).
  - लांबी: ६६८ किमी (महाराष्ट्रात), एकूण १४६५ किमी.
  - तिला 'दक्षिण गंगा' म्हणतात.
  - प्रमुख उपनद्या: प्रवरा, सिंधफणा, मांजरा, पूर्णा, प्राणहिता, इंद्रावती.
* **भीमा नदी**:
  - उगम: भीमाशंकर (पुणे).
  - शेवटी कर्नाटकात कृष्णेस मिळते.
* **कृष्णा नदी**:
  - उगम: महाबळेश्वर (सातारा).
  - उपनद्या: कोयना, वारणा, पंचगंगा, वेण्णा.

## ३. महत्त्वाचे घाट आणि मार्ग
* **कसारा घाट (थळ घाट)**: मुंबई ते नाशिक.
* **बोर घाट**: मुंबई ते पुणे.
* **वरंधा घाट**: भोर ते महाड.
* **आंबोली घाट**: सावंतवाडी ते बेळगाव.

> *Moti Study Smart टीप: स्पर्धा परीक्षेत घाटांचा उत्तरेकडून दक्षिणेकडे क्रम नेहमी विचारला जातो!*`,
      createdAt: now,
    },
    {
      id: 'not_mpsc_02',
      courseId: 'crs_mpsc_01',
      titleEn: 'Panchayat Raj & Administrative Structure Pocket Handbook',
      titleHi: 'पंचायती राज और प्रशासनिक संरचना पॉकेट हैंडबुक',
      titleMr: 'पंचायत राज संपूर्ण तक्ते व परीक्षाभिमुख नोट्स (PDF)',
      pages: 22,
      size: '3.8 MB',
      isPremium: true,
      chapterName: 'प्रकरण २: स्थानिक स्वराज्य संस्था',
      downloadUrl: '/api/notes/download/not_mpsc_02',
      contentMarkdown: `# पंचायत राज व स्थानिक स्वराज्य संस्था (Moti Study Smart Premium)

## १. घटनादुरुस्ती व पार्श्वभूमी
* **७३ वी घटनादुरुस्ती (१९९२)**: ग्रामीण स्थानिक स्वराज्य संस्था (भाग ९, अनुसूची ११ - २९ विषय).
* **७४ वी घटनादुरुस्ती (१९९२)**: नागरी स्थानिक स्वराज्य संस्था (भाग ९A, अनुसूची १२ - १८ विषय).
* **महाराष्ट्र**: १ मे १९६२ रोजी वसंतराव नाईक समितीच्या शिफारशीनुसार त्रिस्तरीय पद्धत लागू करणारे देशातील **तिसरे राज्य**!

## २. ग्रामपंचायत रचना
* किमान सदस्य: ७, कमाल सदस्य: १७ (लोकसंख्येनुसार).
* प्रशासकीय प्रमुख: **ग्रामसेवक** (नेमणूक: मुख्य कार्यकारी अधिकारी - CEO, जिल्हा परिषद).
* राजकीय प्रमुख: **सरपंच** (थेट जनतेतून किंवा सदस्यांमधून राज्य शासनाच्या नियमानुसार).

## ३. पंचायत समिती व जिल्हा परिषद
* **पंचायत समिती**: गट विकास अधिकारी (BDO) हा प्रशासकीय प्रमुख असतो.
* **जिल्हा परिषद**: मुख्य कार्यकारी अधिकारी (IAS दर्जाचा CEO) प्रशासकीय प्रमुख. अध्यक्ष हा राजकीय प्रमुख असतो.`,
      createdAt: now,
    },
    {
      id: 'not_math_01',
      courseId: 'crs_math_10th',
      titleEn: '10th SSC Maths All Formulas & Solved Theorems Sheet',
      titleHi: '10वीं गणित के सभी सूत्र और सिद्ध प्रमेय',
      titleMr: 'इयत्ता १० वी गणित: सर्व सूत्रे, गुणधर्म व प्रमेयांची संकलित वही',
      pages: 18,
      size: '2.9 MB',
      isPremium: false,
      chapterName: 'सर्व प्रकरणे सूत्रे',
      downloadUrl: '/api/notes/download/not_math_01',
      contentMarkdown: `# १० वी गणित: सर्व सूत्रे व शॉर्ट नोट्स

## १. दोन चलांमधील रेषीय समीकरणे
* सामान्य रूप: ax + by + c = 0
* **क्रेमरची पद्धत (Cramer's Rule)**:
  - D = |a1  b1| = (a1*b2 - a2*b1)
        |a2  b2|
  - Dx = |c1  b1|
         |c2  b2|
  - Dy = |a1  c1|
         |a2  c2|
  - x = Dx / D, y = Dy / D (जेव्हा D ≠ 0)

## २. वर्गसमीकरणे (Quadratic Equations)
* सामान्य रूप: ax² + bx + c = 0 (a ≠ 0)
* सूत्र पद्धती: x = [-b ± √(b² - 4ac)] / 2a
* विवेचक (Discriminant) Δ = b² - 4ac:
  - Δ = 0 -> मुळे वास्तव व समान
  - Δ > 0 -> मुळे वास्तव व असमान
  - Δ < 0 -> मुळे वास्तव नाहीत

## ३. अंकगणिती श्रेढी (A.P.)
* n वे पद: tn = a + (n - 1)d
* पहिल्या n पदांची बेरीज: Sn = (n/2)[2a + (n - 1)d] किंवा Sn = (n/2)[t1 + tn]`,
      createdAt: now,
    },
    {
      id: 'not_phys_01',
      courseId: 'crs_phys_12th',
      titleEn: 'Class 12 Physics Formula Book & Derivations (HSC + CET)',
      titleHi: '12वीं भौतिकी सूत्र पुस्तक और व्युत्पत्ति (बोर्ड और सीईटी)',
      titleMr: '१२ वी फिजिक्स: सर्व डेरिव्हेशन्स व फॉर्म्युला शीट (Premium)',
      pages: 36,
      size: '5.2 MB',
      isPremium: true,
      chapterName: 'Rotational Dynamics & Fluids',
      downloadUrl: '/api/notes/download/not_phys_01',
      contentMarkdown: `# Class 12 Physics: Formula & Derivation Booklet

## Chapter 1: Rotational Dynamics
* Centripetal Acceleration: ac = v² / r = ω²r = vω
* Centripetal Force: F = mv² / r = mrω²
* Maximum speed on an unbanked circular road: vmax = √(μs * r * g)
* Banking Angle: tan θ = v² / (r * g) -> v = √(r * g * tan θ)
* Moment of Inertia: I = ∑ mi * ri² = ∫ r² dm
* Parallel Axes Theorem: Io = Ic + M * h²
* Perpendicular Axes Theorem: Iz = Ix + Iy (For planar laminas)

## Chapter 2: Mechanical Properties of Fluids
* Pressure: P = F / A, Gauge Pressure: P - P0 = h * ρ * g
* Surface Tension: T = F / L = W / ΔA
* Excess Pressure inside a liquid bubble: ΔP = 4T / r
* Terminal Velocity: vt = 2 * r² * (ρ - σ) * g / (9 * η)
* Bernoulli's Equation: P + (1/2)ρv² + ρgh = constant`,
      createdAt: now,
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: 'quiz_mpsc_01',
      courseId: 'crs_mpsc_01',
      titleEn: 'MPSC Maharashtra Geography & Polity Mock MCQ Test',
      titleHi: 'एमपीएससी महाराष्ट्र भूगोल और राजव्यवस्था मॉक टेस्ट',
      titleMr: 'एमपीएससी महाराष्ट्र भूगोल व राज्यव्यवस्था सराव परीक्षा',
      timeMinutes: 10,
      passingScore: 3,
      isPremium: false,
      createdAt: now,
      questions: [
        {
          id: 'q1',
          questionEn: 'Which is the highest peak in Maharashtra?',
          questionHi: 'महाराष्ट्र का सबसे ऊँचा पर्वत शिखर कौन सा है?',
          questionMr: 'महाराष्ट्रातील सर्वोच्च पर्वत शिखर कोणते आहे?',
          optionsEn: ['Salher (1567m)', 'Kalsubai (1646m)', 'Mahabaleshwar (1438m)', 'Harishchandragad (1424m)'],
          optionsHi: ['साल्हेर (1567 मी)', 'कलसुबाई (1646 मी)', 'महाबळेश्वर (1438 मी)', 'हरिश्चंद्रगड (1424 मी)'],
          optionsMr: ['साल्हेर (१५६७ मी)', 'कळसूबाई (१६४६ मी)', 'महाबळेश्वर (१४३८ मी)', 'हरिश्चंद्रगड (१४२४ मी)'],
          correctAnswer: 1,
          explanationEn: 'Kalsubai is the highest peak in Maharashtra at 1646 meters, located in Akole taluka, Ahmednagar district.',
          explanationHi: 'कलसुबाई महाराष्ट्र का सर्वोच्च शिखर (1646 मीटर) है जो अहमदनगर जिले में स्थित है।',
          explanationMr: 'कळसूबाई हे सह्याद्रीतील १६४६ मीटर उंचीचे महाराष्ट्रातील सर्वोच्च शिखर असून ते अहमदनगर जिल्ह्यातील अकोले तालुक्यात आहे.',
        },
        {
          id: 'q2',
          questionEn: 'Where does the Godavari river originate in Maharashtra?',
          questionHi: 'गोदावरी नदी का उद्गम महाराष्ट्र में कहाँ से होता है?',
          questionMr: 'गोदावरी नदीचा उगम महाराष्ट्रात कोठे होतो?',
          optionsEn: ['Mahabaleshwar', 'Bhimashankar', 'Trimbakeshwar (Nashik)', 'Toranmal'],
          optionsHi: ['महाबळेश्वर', 'भीमाशंकर', 'त्र्यंबकेश्वर (नाशिक)', 'तोरणमाळ'],
          optionsMr: ['महाबळेश्वर', 'भीमाशंकर', 'त्र्यंबकेश्वर (नाशिक)', 'तोरणमाळ'],
          correctAnswer: 2,
          explanationEn: 'Godavari originates at Brahmagiri hills in Trimbakeshwar near Nashik.',
          explanationHi: 'गोदावरी नदी नाशिक के पास त्र्यंबकेश्वर की ब्रह्मगिरी पहाड़ियों से निकलती है।',
          explanationMr: 'गोदावरी नदी नाशिकजवळील त्र्यंबकेश्वर येथे ब्रह्मगिरी पर्वतात उगम पावते. ही दक्षिण गंगा म्हणून ओळखली जाते.',
        },
        {
          id: 'q3',
          questionEn: 'Who is the administrative head of a Gram Panchayat?',
          questionHi: 'ग्रामपंचायत का प्रशासनिक प्रमुख कौन होता है?',
          questionMr: 'ग्रामपंचायतीचा प्रशासकीय प्रमुख कोण असतो?',
          optionsEn: ['Sarpanch', 'Gram Sevak', 'BDO (Gat Vikas Adhikari)', 'Talathi'],
          optionsHi: ['सरपंच', 'ग्रामसेवक', 'बीडीओ (प्रखंड विकास अधिकारी)', 'तलाठी'],
          optionsMr: ['सरपंच', 'ग्रामसेवक', 'गट विकास अधिकारी', 'तलाठी'],
          correctAnswer: 1,
          explanationEn: 'The Gram Sevak is the administrative secretary of the Gram Panchayat, appointed by the Zilla Parishad CEO.',
          explanationHi: 'ग्रामसेवक ग्रामपंचायत का प्रशासनिक प्रमुख/सचिव होता है, जबकि सरपंच राजनीतिक प्रमुख होता है।',
          explanationMr: 'ग्रामसेवक हा ग्रामपंचायतीचा प्रशासकीय प्रमुख व सचिव असतो. सरपंच हा लोकनियुक्त राजकीय प्रमुख असतो.',
        },
        {
          id: 'q4',
          questionEn: 'Kasara Ghat (Thal Ghat) connects which two major cities?',
          questionHi: 'कसारा घाट (थल घाट) किन दो शहरों को जोड़ता है?',
          questionMr: 'कसारा घाट (थळ घाट) कोणत्या दोन शहरांमधील मार्गावर आहे?',
          optionsEn: ['Mumbai - Pune', 'Mumbai - Nashik', 'Pune - Satara', 'Kolhapur - Goa'],
          optionsHi: ['मुंबई - पुणे', 'मुंबई - नाशिक', 'पुणे - सातारा', 'कोल्हापुर - गोवा'],
          optionsMr: ['मुंबई - पुणे', 'मुंबई - नाशिक', 'पुणे - सातारा', 'कोल्हापूर - गोवा'],
          correctAnswer: 1,
          explanationEn: 'Kasara Ghat (Thal Ghat) is situated on the Mumbai-Nashik national highway and railway line.',
          explanationHi: 'कसारा घाट मुंबई और नाशिक को जोड़ता है। मुंबई-पुणे मार्ग पर भोर घाट स्थित है।',
          explanationMr: 'कसारा घाट (थळ घाट) मुंबई-नाशिक महामार्गावर आहे. मुंबई-पुणे मार्गावर बोर घाट आहे.',
        },
        {
          id: 'q5',
          questionEn: 'Which constitutional amendment provided constitutional status to Panchayati Raj?',
          questionHi: 'किस संविधान संशोधन द्वारा पंचायती राज को संवैधानिक दर्जा दिया गया?',
          questionMr: 'कोणत्या घटनादुरुस्तीने पंचायत राज व्यवस्थेला घटनात्मक दर्जा दिला?',
          optionsEn: ['42nd Amendment', '44th Amendment', '73rd Amendment (1992)', '86th Amendment'],
          optionsHi: ['42वां संशोधन', '44वां संशोधन', '73वां संशोधन (1992)', '86वां संशोधन'],
          optionsMr: ['४२ वी घटनादुरुस्ती', '४४ वी घटनादुरुस्ती', '७३ वी घटनादुरुस्ती (१९९२)', '८६ वी घटनादुरुस्ती'],
          correctAnswer: 2,
          explanationEn: 'The 73rd Constitutional Amendment Act, 1992 inserted Part IX and 11th Schedule giving constitutional status to Panchayats.',
          explanationHi: '73वें संविधान संशोधन अधिनियम 1992 के तहत संविधान में भाग 9 और 11वीं अनुसूची जोड़कर पंचायती राज को संवैधानिक मान्यता दी गई।',
          explanationMr: '७३ व्या घटनादुरुस्ती कायदा १९९२ द्वारे राज्यघटनेत भाग ९ व ११ वी अनुसूची जोडून पंचायत राजला घटनात्मक दर्जा मिळाला.',
        },
      ],
    },
    {
      id: 'quiz_math_01',
      courseId: 'crs_math_10th',
      titleEn: 'Class 10 Linear Equations & Cramer Rule Speed Quiz',
      titleHi: '10वीं कक्षा रैखिक समीकरण और क्रैमर नियम क्विज',
      titleMr: 'इयत्ता १० वी: दोन चलांमधील रेषीय समीकरणे सराव चाचणी',
      timeMinutes: 8,
      passingScore: 3,
      isPremium: false,
      createdAt: now,
      questions: [
        {
          id: 'qm1',
          questionEn: 'Find the value of determinant: | 4  3 | / | 2  5 |',
          questionHi: 'निश्चयक का मान ज्ञात कीजिए: | 4  3 | / | 2  5 |',
          questionMr: 'निश्चयकाची किंमत काढा: | ४  ३ | / | २  ५ |',
          optionsEn: ['26', '14', '7', '18'],
          optionsHi: ['26', '14', '7', '18'],
          optionsMr: ['२६', '१४', '७', '१८'],
          correctAnswer: 1,
          explanationEn: 'Determinant = (4 * 5) - (3 * 2) = 20 - 6 = 14.',
          explanationHi: 'निश्चयक = (4 × 5) - (3 × 2) = 20 - 6 = 14.',
          explanationMr: 'निश्चयकाची किंमत = (४ × ५) - (३ × २) = २० - ६ = १४.',
        },
        {
          id: 'qm2',
          questionEn: 'In Cramer’s method, if Dx = 24 and D = 8, then what is the value of x?',
          questionHi: 'क्रैमर नियम में, यदि Dx = 24 और D = 8 है, तो x का मान क्या होगा?',
          questionMr: 'क्रेमरच्या पद्धतीत जर Dx = २४ आणि D = ८ असेल, तर x ची किंमत किती?',
          optionsEn: ['2', '3', '4', '16'],
          optionsHi: ['2', '3', '4', '16'],
          optionsMr: ['२', '३', '४', '१६'],
          correctAnswer: 1,
          explanationEn: 'x = Dx / D = 24 / 8 = 3.',
          explanationHi: 'x = Dx / D = 24 / 8 = 3.',
          explanationMr: 'x = Dx / D = २४ / ८ = ३.',
        },
        {
          id: 'qm3',
          questionEn: 'What is the degree of a linear equation in two variables?',
          questionHi: 'दो चरों वाले रैखिक समीकरण की घात (Degree) क्या होती है?',
          questionMr: 'दोन चलांमधील रेषीय समीकरणाची कोटी (Degree) किती असते?',
          optionsEn: ['0', '1', '2', 'Variable'],
          optionsHi: ['0', '1', '2', 'परिवर्तनीय'],
          optionsMr: ['०', '१', '२', 'बदलती'],
          correctAnswer: 1,
          explanationEn: 'The degree of every term containing a variable in a linear equation is 1.',
          explanationHi: 'रैखिक समीकरण के प्रत्येक चर वाले पद की अधिकतम घात 1 होती है।',
          explanationMr: 'दोन चलांमधील रेषीय समीकरणात चलांचा समाविष्ट असलेल्या प्रत्येक पदाची कोटी १ असते.',
        },
        {
          id: 'qm4',
          questionEn: 'If x + y = 10 and x - y = 4, what is the value of x?',
          questionHi: 'यदि x + y = 10 और x - y = 4 है, तो x का मान क्या है?',
          questionMr: 'जर x + y = १० आणि x - y = ४ असेल, तर x ची किंमत किती?',
          optionsEn: ['5', '6', '7', '8'],
          optionsHi: ['5', '6', '7', '8'],
          optionsMr: ['५', '६', '७', '८'],
          correctAnswer: 2,
          explanationEn: 'Adding both equations: 2x = 14 => x = 7. (y = 3)',
          explanationHi: 'दोनों समीकरणों को जोड़ने पर: 2x = 14 => x = 7.',
          explanationMr: 'दोन्ही समीकरणे मिळवल्यास: २x = १४ => x = ७ आणि y = ३.',
        },
      ],
    },
    {
      id: 'quiz_phys_01',
      courseId: 'crs_phys_12th',
      titleEn: '12th HSC Physics: Rotational Dynamics & Banking Angle (CET Standard)',
      titleHi: '12वीं भौतिकी: घूर्णी गति और बैंकिंग कोण क्विज',
      titleMr: '१२ वी भौतिकशास्त्र: रोटेशनल डायनॅमिक्स व सीईटी संभाव्य प्रश्न',
      timeMinutes: 12,
      passingScore: 4,
      isPremium: true,
      createdAt: now,
      questions: [
        {
          id: 'qp1',
          questionEn: 'What is the formula for the optimum speed of a vehicle on a banked road of radius r with banking angle θ?',
          questionHi: 'बैंकिंग कोण θ और त्रिज्या r वाली सड़क पर वाहन की इष्टतम गति का सूत्र क्या है?',
          questionMr: 'बँक केलेल्या रस्त्यावर (त्रिज्या r, कोन θ) वाहनाच्या सुरक्षित कमाल वेगाचे सूत्र काय आहे?',
          optionsEn: ['v = √(rg / tan θ)', 'v = √(rg tan θ)', 'v = rg sin θ', 'v = √(r / (g tan θ))'],
          optionsHi: ['v = √(rg / tan θ)', 'v = √(rg tan θ)', 'v = rg sin θ', 'v = √(r / (g tan θ))'],
          optionsMr: ['v = √(rg / tan θ)', 'v = √(rg tan θ)', 'v = rg sin θ', 'v = √(r / (g tan θ))'],
          correctAnswer: 1,
          explanationEn: 'The most safe or optimum speed without relying on friction is v = √(rg tan θ).',
          explanationHi: 'घर्षण के बिना सुरक्षित गति v = √(rg tan θ) होती है।',
          explanationMr: 'घर्षणावर अवलंबून नसलेला योग्य सुरक्षित वेग v = √(rg tan θ) असतो.',
        },
        {
          id: 'qp2',
          questionEn: 'The SI unit of Moment of Inertia is:',
          questionHi: 'जड़त्व आघूर्ण (Moment of Inertia) का SI मात्रक क्या है?',
          questionMr: 'जडत्वाचा आघूर्ण (Moment of Inertia) चे SI एकक कोणते आहे?',
          optionsEn: ['kg m', 'kg m²', 'kg / m²', 'N m'],
          optionsHi: ['kg m', 'kg m²', 'kg / m²', 'N m'],
          optionsMr: ['kg m', 'kg m²', 'kg / m²', 'N m'],
          correctAnswer: 1,
          explanationEn: 'Moment of Inertia I = m * r², so unit is kilogram meter squared (kg·m²).',
          explanationHi: 'I = m * r² के अनुसार SI इकाई kg m² है।',
          explanationMr: 'I = m * r² नुसार SI पद्धतीतील एकक kg m² आहे.',
        },
        {
          id: 'qp3',
          questionEn: 'Which law relates the moment of inertia about parallel axes?',
          questionHi: 'समानांतर अक्षों के जड़त्व आघूर्ण को कौन सा प्रमेय जोड़ता है?',
          questionMr: 'समांतर अक्षांचे प्रमेय कोणते सूत्र दर्शवते?',
          optionsEn: ['Io = Ic + Mh²', 'Iz = Ix + Iy', 'Io = Ic - Mh²', 'T = Iα'],
          optionsHi: ['Io = Ic + Mh²', 'Iz = Ix + Iy', 'Io = Ic - Mh²', 'T = Iα'],
          optionsMr: ['Io = Ic + Mh²', 'Iz = Ix + Iy', 'Io = Ic - Mh²', 'T = Iα'],
          correctAnswer: 0,
          explanationEn: 'Parallel Axes Theorem states Io = Ic + M*h², where h is perpendicular distance between parallel axes.',
          explanationHi: 'समानांतर अक्ष प्रमेय: Io = Ic + Mh²।',
          explanationMr: 'समांतर अक्षांचे प्रमेय Io = Ic + Mh² या सूत्राने मांडले जाते.',
        },
      ],
    },
    {
      id: 'quiz_py_01',
      courseId: 'crs_college_python',
      titleEn: 'Python Programming Essentials & DSA Basics Quiz',
      titleHi: 'पायथन प्रोग्रामिंग और डेटा संरचना मूल क्विज',
      titleMr: 'पायथन प्रोग्रामिंग व डेटा स्ट्रक्चर्स चाचणी',
      timeMinutes: 10,
      passingScore: 3,
      isPremium: false,
      createdAt: now,
      questions: [
        {
          id: 'qpy1',
          questionEn: 'Which data structure in Python is immutable?',
          questionHi: 'पायथन में कौन सी डेटा संरचना अपरिवर्तनीय (Immutable) है?',
          questionMr: 'पायथनमध्ये खालीलपैकी कोणता डेटा प्रकार अपरिवर्तनीय (Immutable) आहे?',
          optionsEn: ['List', 'Dictionary', 'Tuple', 'Set'],
          optionsHi: ['List', 'Dictionary', 'Tuple', 'Set'],
          optionsMr: ['List', 'Dictionary', 'Tuple', 'Set'],
          correctAnswer: 2,
          explanationEn: 'Tuples are ordered and immutable collections in Python.',
          explanationHi: 'टपल (Tuple) को एक बार परिभाषित करने के बाद बदला नहीं जा सकता।',
          explanationMr: 'टपल्स (Tuples) तयार केल्यानंतर त्यामधील घटकांमध्ये बदल करता येत नाही (Immutable).',
        },
        {
          id: 'qpy2',
          questionEn: 'What is the time complexity of searching an element in a balanced binary search tree (BST)?',
          questionHi: 'संतुलित बाइनरी सर्च ट्री (BST) में तत्व खोजने की समय जटिलता क्या है?',
          questionMr: 'संतुलित बायनरी सर्च ट्री (BST) मध्ये शोध घेण्याची Time Complexity काय असते?',
          optionsEn: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          optionsHi: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          optionsMr: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctAnswer: 2,
          explanationEn: 'Searching in a balanced BST halves the search space each step, giving O(log n).',
          explanationHi: 'बैलेंस्ड बाइनरी सर्च ट्री में खोज की जटिलता O(log n) होती है।',
          explanationMr: 'प्रत्येक टप्प्यावर शोध क्षेत्र निम्मे होत असल्यामुळे संतुलित BST मध्ये शोध ओ(लॉग एन) म्हणजेच O(log n) असतो.',
        },
      ],
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: 'pay_sample_01',
      orderId: 'order_moti_9921',
      paymentId: 'pay_rzp_mock_8812',
      userId: 'usr_priya_sharma',
      userEmail: 'priya.s@example.com',
      userName: 'Priya Sharma',
      amount: 49,
      currency: 'INR',
      status: 'success',
      plan: 'monthly_premium',
      signature: 'sig_verified_mock_99182a',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    users,
    categories,
    courses,
    videos,
    notes,
    quizzes,
    payments,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db.json, recreating defaults', err);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing db.json', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Category): Category {
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
    this.save();
    return this.data.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Courses
  public getCourses(): Course[] {
    return this.data.courses;
  }

  public findCourseById(id: string): Course | undefined {
    return this.data.courses.find((c) => c.id === id);
  }

  public addCourse(course: Course): Course {
    this.data.courses.push(course);
    this.save();
    return course;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | null {
    const idx = this.data.courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.courses[idx] = { ...this.data.courses[idx], ...updates };
    this.save();
    return this.data.courses[idx];
  }

  public deleteCourse(id: string): boolean {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter((c) => c.id !== id);
    // Also remove videos, notes and quizzes belonging to this course
    this.data.videos = this.data.videos.filter((v) => v.courseId !== id);
    this.data.notes = this.data.notes.filter((n) => n.courseId !== id);
    this.data.quizzes = this.data.quizzes.filter((q) => q.courseId !== id);
    if (this.data.courses.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Videos
  public getVideos(courseId?: string): VideoLecture[] {
    if (courseId) {
      return this.data.videos.filter((v) => v.courseId === courseId);
    }
    return this.data.videos;
  }

  public findVideoById(id: string): VideoLecture | undefined {
    return this.data.videos.find((v) => v.id === id);
  }

  public addVideo(video: VideoLecture): VideoLecture {
    this.data.videos.push(video);
    this.save();
    return video;
  }

  public updateVideo(id: string, updates: Partial<VideoLecture>): VideoLecture | null {
    const idx = this.data.videos.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
    this.save();
    return this.data.videos[idx];
  }

  public deleteVideo(id: string): boolean {
    const initialLen = this.data.videos.length;
    this.data.videos = this.data.videos.filter((v) => v.id !== id);
    if (this.data.videos.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Notes
  public getNotes(courseId?: string): PDFNote[] {
    if (courseId) {
      return this.data.notes.filter((n) => n.courseId === courseId);
    }
    return this.data.notes;
  }

  public findNoteById(id: string): PDFNote | undefined {
    return this.data.notes.find((n) => n.id === id);
  }

  public addNote(note: PDFNote): PDFNote {
    this.data.notes.push(note);
    this.save();
    return note;
  }

  public updateNote(id: string, updates: Partial<PDFNote>): PDFNote | null {
    const idx = this.data.notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.data.notes[idx] = { ...this.data.notes[idx], ...updates };
    this.save();
    return this.data.notes[idx];
  }

  public deleteNote(id: string): boolean {
    const initialLen = this.data.notes.length;
    this.data.notes = this.data.notes.filter((n) => n.id !== id);
    if (this.data.notes.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Quizzes
  public getQuizzes(courseId?: string): Quiz[] {
    if (courseId) {
      return this.data.quizzes.filter((q) => q.courseId === courseId);
    }
    return this.data.quizzes;
  }

  public findQuizById(id: string): Quiz | undefined {
    return this.data.quizzes.find((q) => q.id === id);
  }

  public addQuiz(quiz: Quiz): Quiz {
    this.data.quizzes.push(quiz);
    this.save();
    return quiz;
  }

  public updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
    const idx = this.data.quizzes.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.quizzes[idx] = { ...this.data.quizzes[idx], ...updates };
    this.save();
    return this.data.quizzes[idx];
  }

  public deleteQuiz(id: string): boolean {
    const initialLen = this.data.quizzes.length;
    this.data.quizzes = this.data.quizzes.filter((q) => q.id !== id);
    if (this.data.quizzes.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Payments
  public getPayments(): PaymentRecord[] {
    return this.data.payments;
  }

  public addPayment(payment: PaymentRecord): PaymentRecord {
    this.data.payments.unshift(payment);
    this.save();
    return payment;
  }
}

export const db = new Database();
