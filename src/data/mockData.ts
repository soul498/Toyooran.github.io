import { Project, Product, Service, Article } from '../types';

export const COMPANY_INFO = {
  nameFa: 'طیوران صنعت پویا',
  nameEn: 'TOYOORAN',
  tagline: 'مشاور، طراح و مجری توسعه و بهره‌برداری پروژه‌های صنعتی',
  subTagline: 'تولیدکننده بشقاب‌های دانخوری پروانه‌ای | تولیدکننده تخصصی جت هیتر و ماشین‌آلات خوراک',
  experienceYears: '۵۰+',
  completedProjects: '۲۰۰+',
  activeProvinces: 'ملی و بین‌المللی',
  customerSatisfaction: '۹۸٪',
  phone: '۰۹۱۱ ۵۱۱ ۶۲۵۸',
  directSalesPhone: '۰۹۱۱ ۵۱۱ ۶۲۵۸',
  technicalSupportPhone: '۰۹۱۱ ۵۱۱ ۶۲۵۸',
  website: 'www.toyooran.com',
  address: 'مشهد، میدان مادر، مجتمع تجاری ادیب، طبقه ۳، واحد ۴۰۶',
  rdAddress: 'گرگان، بلوار بهشتی، دانشگاه منابع طبیعی گرگان',
  factoryAddress: 'مشهد، بلوار میثاق، کارخانجات صنعتی طیوران صنعت پویا',
  workingHours: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ | پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰',
  fdaLicense: '',
  socialLinks: {
    instagram: 'https://www.instagram.com/toyooranco/',
    telegram: 'https://t.me/toyooranco',
    linkedin: 'https://www.linkedin.com/company/toyooranco',
    rubika: 'https://rubika.ir/toyooranco',
    aparat: 'https://www.aparat.com/toyooranco',
    youtube: 'http://www.youtube.com/@Toyooranco',
    whatsapp: '',
    bale: '',
    eitaa: '',
  },
  locations: [
    {
      id: 'hq-01',
      title: 'دفتر مرکزی مشهد',
      type: 'headquarter',
      address: 'مشهد، میدان مادر، مجتمع تجاری ادیب، طبقه ۳، واحد ۴۰۶',
      lat: 36.3263,
      lng: 59.50566,
      mapEmbedUrl: 'https://neshan.org/maps/@36.3263,59.50566,17z',
      baladEmbedUrl: 'https://balad.ir/embed?p=6CHymGXdZRyn6u'
    },
    {
      id: 'rd-01',
      title: 'دفتر تحقیق و توسعه',
      type: 'rd',
      address: 'گرگان، بلوار بهشتی',
      lat: 36.8428141,
      lng: 54.4407077,
      mapEmbedUrl: 'https://neshan.org/maps/@36.8428141,54.4407077,17z',
      baladEmbedUrl: 'https://balad.ir/embed?p=2mnxzJeK25Qq8Q'
    }
  ]
};

export const CATEGORIES_DATA = [
  {
    id: 'heating',
    title: 'سیستم گرمایش مرغداری',
    icon: 'Thermometer',
    productCount: 29,
    image: "/images/machine-1.jpg",
    badge: "جدید",
    titleEn: "Heating",
    description: "انواع هیترهای گازی، گازوئیلی، برقی و کوره‌های هوای گرم"
  },
  {
    id: 'ventilation',
    title: 'تهویه مرغداری',
    icon: 'Fan',
    productCount: 19,
    image: "/images/poultry-1.jpg",
    badge: "",
    titleEn: "Ventilation",
    description: "هواکش‌های صنعتی ۱۴۰ و ۱۰۰، فن‌های سیرکوله و آکسیال"
  },
  {
    id: 'drinking',
    title: 'آبخوری مرغداری',
    icon: 'Droplets',
    productCount: 22,
    image: "/images/equipment-1.jpg",
    badge: "",
    titleEn: "Drinking",
    description: "سیستم آبخوری نیپل تمام استیل، پمپ دوزاترون و اتصالات"
  },
  {
    id: 'cooling',
    title: 'سیستم سرمایش مرغداری',
    icon: 'Snowflake',
    productCount: 11,
    image: "/images/machine-1.jpg",
    badge: "",
    titleEn: "Cooling",
    description: "کولرهای پلیمری سلولزی، پدهای خنک‌کننده و مه‌پاش"
  },
  {
    id: 'inlet',
    title: 'اینلت',
    icon: 'Wind',
    productCount: 8,
    image: "/images/poultry-1.jpg",
    badge: "",
    titleEn: "Inlet",
    description: "پنجره‌های اینلت هوشمند، بادشکن و شاترهای ورودی هوا"
  },
  {
    id: 'feeding',
    title: 'بشقاب دانخوری',
    icon: 'Wheat',
    productCount: 4,
    image: "/images/equipment-1.jpg",
    badge: "",
    titleEn: "Feeding",
    description: "بشقاب‌های دانخوری چیکن پلاس، کوناوی و سیستم‌های اتوماسیون"
  },
  {
    id: 'cage',
    title: 'قفس مرغداری',
    icon: 'LayoutGrid',
    productCount: 4,
    image: "/images/equipment-1.jpg",
    badge: "",
    titleEn: "Cage",
    description: "قفس‌های باتری تخمگذار، گوشتی، پولت و آشیانه اتوماتیک"
  },
  {
    id: 'silo',
    title: 'سیلو و انتقال دان',
    icon: 'Database',
    productCount: 3,
    image: "/images/machine-1.jpg",
    badge: "",
    titleEn: "Silo",
    description: "سیلوهای ذخیره دان، خطوط اوگر و آسیاب میکسر"
  },
  {
    id: 'other',
    title: 'سایر تجهیزات',
    icon: 'MoreHorizontal',
    productCount: 1,
    image: "/images/equipment-1.jpg",
    badge: "",
    titleEn: "Other",
    description: "سایر ادوات، اتوماسیون و ماشین‌آلات تخصصی"
  }
];

export { PRODUCTS } from './productsData';

export const PROJECTS: Project[] = [
  {
    id: 'proj-broiler-novin-120k',
    title: 'مجتمع پرورش مرغ گوشتی ۱۲۰ هزار قطعه‌ای نوین فارم',
    type: 'broiler',
    typeTitle: 'مرغداری گوشتی مکانیزه',
    capacity: '۱۲۰,۰۰۰ قطعه در هر دوره',
    location: 'مازندران، ساری',
    year: '۱۴۰۲',
    image: '/images/poultry-1.jpg',
    servicesProvided: [
      'طراحی و احداث صفر تا صد سوله مدرن سبک بهداشتی',
      'نصب بشقاب‌های دانخوری پروانه‌ای',
      'تجهیز خطوط آبخوری نیپل TSPK تمام استیل کارنو',
      'نصب دریچه‌های اینلت، هواکش‌های ۱۴۰ و جت هیترهای ۱۰۰ دوگانه‌سوز'
    ],
    equipmentSummary: [
      'بشقاب‌های دانخوری پروانه‌ای',
      'خطوط آبخوری نیپل TSPK با سوزن استیل و کاپ دوپایه Sدار',
      'دریچه‌های اینلت هوشمند و هواکش‌های ۱۴۰ دمپردار',
      'جت هیترهای تمام استیل ۱۰۰ هزار دوگانه‌سوز'
    ],
    keyOutcome: '',
    caseStudy: {
      problem: 'کارفرما با مشکل اتلاف بالای دان با سینی‌های دستی در سنین ابتدایی، رطوبت بالای بستر و نوسانات دمایی سالن مواجه بود.',
      clientNeed: 'نیاز به سوله عایق بهداشتی، دانخوری با قابلیت تغذیه از یک‌روزگی و تهویه استاندارد با جت هیترهای بدون دود و کم‌مصرف.',
      solution: 'احداث سوله سبک بهداشتی، نصب بشقاب‌های دانخوری پروانه‌ای، خطوط آبخوری نیپل TSPK، دریچه‌های اینلت و جت هیترهای ۱۰۰ دوگانه طیوران صنعت پویا.',
      processSteps: [
        { title: 'فاز ۱: طراحی و ساخت سوله بهداشتی', desc: 'احداث سازه سبک با پوشش ساندویچ پانل و کف صیقلی' },
        { title: 'فاز ۲: نصب تجهیزات دانخوری و آبخوری', desc: 'نصب بشقاب‌های دانخوری پروانه‌ای و نیپل‌های TSPK کارنو' },
        { title: 'فاز ۳: تجهیز سیستم تهویه و گرمایش', desc: 'استقرار دریچه‌های اینلت، فن‌های ۱۴۰ و جت هیترهای ۱۰۰' },
        { title: 'فاز ۴: راه‌اندازی و تست خط', desc: 'تست بدون بار و تست جوجه‌ریزی زیر نظر تیم فنی شرکت' }
      ],
      equipmentList: [
        'بشقاب دانخوری پروانه‌ای',
        'سیستم آبخوری نیپل TSPK کارنو تمام استیل',
        'دریچه پنجره اینلت تهویه عرضی',
        'جت هیتر ۱۰۰ دوگانه‌سوز موشکی',
        'هواکش ۱۴۰ صنعتی دمپردار'
      ],
      results: [
        { label: 'کاهش تلفات', value: '۱.۸٪', detail: 'کنترل کامل اقلیم و کیفیت بستر' },
        { label: 'صرفه‌جویی سوخت', value: '۳۵٪', detail: 'به لطف جت هیترها و دریچه‌های اینلت' }
      ]
    }
  },
  {
    id: 'proj-layer-negin-150k',
    title: 'فارم مرغ تخم‌گذار تمام اتوماتیک ۱۵۰ هزار سر نگین زرین',
    type: 'layer',
    typeTitle: 'مرغداری تخم‌گذار صنعتی',
    capacity: '۱۵۰,۰۰۰ سر مرغ تخم‌گذار',
    location: 'اصفهان، شهرک طیور',
    year: '۱۴۰۱',
    image: '/images/poultry-1.jpg',
    servicesProvided: [
      'ساخت سوله استاندارد صنعتی',
      'تجهیز خطوط آبخوری نیپل TSPK کارنو',
      'تأمین کنسانتره تخصصی Mac تخم‌گذار ۲.۵٪ و ۵٪',
      'نصب سیستم تهویه تونلی و پدهای سلولزی'
    ],
    equipmentSummary: [
      'سیستم آبخوری نیپل TSPK تمام استیل',
      'کنسانتره تخصصی Mac تخم‌گذار',
      'هواکش‌های ۱۴۰ و پدهای سلولزی ۷۰۹۰'
    ],
    keyOutcome: 'تولید روزانه ۱۴۰,۰۰۰ عدد تخم‌مرغ با کیفیت پوسته عالی و حداقل افت شکستگی'
  },
  {
    id: 'proj-feed-mill-damoon',
    title: 'کارخانه صنعتی فرآوری خوراک دام، طیور و آبزیان دامون (۲۰ تن/ساعت)',
    type: 'feed_mill',
    typeTitle: 'کارخانه خوراک و مکمل',
    capacity: '۲۰ تن در ساعت پلت استاندارد',
    location: 'خراسان رضوی، مشهد',
    year: '۱۴۰۳',
    image: '/images/equipment-1.jpg',
    servicesProvided: [
      'طراحی کامل خط فرآوری و ساخت ماشین‌آلات سنگین',
      'تأمین دستگاه‌های پرس پلت، میکرودایزینگ، آسیاب چکشی و میکسر دوشفت',
      'نصب کاندیشنر پخت، کرامبلر، کولر درایر و سیستم بسته‌بندی',
      'فرمولاسیون مکمل‌ها و جایگزین‌های ذرت و جو'
    ],
    equipmentSummary: [
      'پرس پلت‌های صنعتی گیربکسی',
      'دستگاه میکرودایزینگ دقیق ریزمغذی‌ها',
      'آسیاب چکشی قطره‌ای و میکسر دوشفت پرسرعت',
      'کاندیشنر استیل، کرامبلر، کولر درایر و الواتور انتقال'
    ],
    keyOutcome: 'تولید پلت با شاخص PDI بالای ۹۶.۸٪ و ضریب یکنواختی CV زیر ۴٪',
    caseStudy: {
      problem: 'کیفیت پایین پلت‌های تولیدی، خطای دوزینگ ویتامین‌ها و هزینه‌های بالای نهاده‌های ذرت و جو.',
      clientNeed: 'احداث خط تمام اتوماتیک با دستگاه میکرودایزینگ و پرس پلت‌های پربازده با ماندگاری بالا.',
      solution: 'طراحی خط جامع با ماشین‌آلات ساخت طیوران صنعت پویا شامل میکرودایزینگ، پرس پلت، کاندیشنر دوجداره، اکسترودر، آسیاب چکشی و سیستم خنک‌کننده.',
      processSteps: [
        { title: 'فاز ۱: مهندسی خط و ساخت ماشین‌آلات', desc: 'طراحی استراکچر ۴ طبقه و ساخت پلت پرس و میکرودایزینگ' },
        { title: 'فاز ۲: نصب و پایپینگ خط بخار', desc: 'نصب کاندیشنرها، لوله‌کشی بویلر و سرندها' },
        { title: 'فاز ۳: تست بچینگ و کنترل کیفیت پلت', desc: 'آزمون دوام PDI و آزمون CV یکنواختی میکس' }
      ],
      equipmentList: [
        'پرس پلت صنعتی گیربکسی',
        'دستگاه میکرودایزینگ چندهاپره',
        'میکسر دوشفت پدلی و آسیاب چکشی',
        'کاندیشنر دوجداره استیل و کولر درایر'
      ],
      results: [
        { label: 'شاخص دوام پلت (PDI)', value: '۹۶.۸٪', detail: 'حداقل خاکه در حمل‌ونقل و فارم' },
        { label: 'یکنواختی میکس (CV)', value: '۳.۵٪', detail: 'دقت بی‌نظیر با سیستم میکرودایزینگ' },
        { label: 'کاهش هزینه نهاده', value: '۱۸٪', detail: 'به کمک فرمولاسیون جایگزین ذرت و جو' }
      ]
    }
  },
  {
    id: 'proj-aqua-feed-plant',
    title: 'خط تولید تخصصی خوراک آبزیان و پت فود دریای خزر',
    type: 'feed_mill',
    typeTitle: 'خط خوراک آبزیان و پت فود',
    capacity: '۵ تن در ساعت پلت اکسترود شناور',
    location: 'گیلان، رشت',
    year: '۱۴۰۲',
    image: '/images/silo-1.jpg',
    servicesProvided: [
      'تأمین دستگاه اکسترودر صنعتی آبزیان',
      'نصب خشک‌کن تونلی (Tunnel Dryer) چندطبقه',
      'تجهیز خط کوتینگ روغن و ملاس',
      'تأمین پودر ماهی و مکمل‌های تخصصی آبزیان'
    ],
    equipmentSummary: [
      'اکسترودر صنعتی آبزیان',
      'خشک‌کن تونلی پیوسته (Tunnel Dryer)',
      'سیستم بسته‌بندی اتوماتیک'
    ],
    keyOutcome: 'تولید خوراک شناور و پایدار ماهی با زمان غوطه‌وری بیش از ۱۸ ساعت در آب'
  }
];

export const PUBLIC_SERVICE_IDS = [
  'srv-machinery-manufacturing',
  'srv-poultry-equipment-supply',
  'srv-turnkey-shed',
  'srv-feed-formulation-pharma',
] as const;

export const SERVICES: Service[] = [
  {
    id: 'srv-turnkey-shed',
    title: 'طراحی، ساخت و تجهیز کامل سوله و کارخانجات',
    tagline: 'ساخت و تجهیز صفر تا صد سوله، کارخانجات و سالن‌های مرغداری با سازه‌های مدرن و سبک بهداشتی و صنعتی',
    iconName: 'Building2',
    problemSolved: 'ناهماهنگی میان سازنده سوله و نصاب تجهیزات، هدررفت زمان و انرژی و ساخت سوله‌های غیراستاندارد.',
    whatWeProvide: [
      'ساخت و تجهیز صفر تا صد سوله، کارخانجات و سالن‌های مرغداری',
      'ساخت کامل سوله با سازه‌های مدرن و سبک استاندارد',
      'پوشش انواع سوله و کارخانجات: بهداشتی و صنعتی',
      'تجهیز کامل سیستم دانخوری، آبخوری، تهویه و کنترل هوشمند'
    ],
    workflow: [
      { stepNumber: 1, title: 'مشاوره و طراحی سازه', description: 'طراحی نقشه‌های محاسباتی سوله سبک بهداشتی و صنعتی', deliverable: 'دفترچه محاسبات و نقشه اجرایی' },
      { stepNumber: 2, title: 'ساخت اسکلت و پوشش پانل', description: 'برپایی سازه، پوشش ساندویچ پانل و کف‌سازی صیقلی', deliverable: 'سازه هوابند و عایق کامل' },
      { stepNumber: 3, title: 'تجهیز خطوط و تحویل آماده جوجه‌ریزی', description: 'نصب خطوط دان، آب، فن‌ها، اینلت و جت هیترها', deliverable: 'پروژه آماده بهره‌برداری کامل' }
    ],
    suitableFor: ['سرمایه‌گذاران جدید مرغداری، کارخانجات خوراک و فارم‌های در حال توسعه'],
    relatedEquipmentCategories: ['structure', 'feeding', 'drinking', 'ventilation'],
    sampleProjectIds: ['proj-broiler-novin-120k', 'proj-layer-negin-150k'],
    faqs: [
      {
        q: 'آیا سازه‌های سبک قابلیت تحمل بار برف و باد سنگین را دارند؟',
        a: 'بله، تمامی سازه‌ها بر مبنای مباحث مقررات ملی ساختمان و آیین‌نامه ۲۸۰۰ به طور دقیق برای اقلیم هر منطقه محاسبه و مهندسی می‌شوند.'
      }
    ]
  },
  {
    id: 'srv-machinery-manufacturing',
    title: 'طراحی و تولید ماشین‌آلات خط تولید خوراک و مکمل',
    tagline: 'پرس پلت، اکسترودر، میکرودایزینگ، فلیکر اسب، آسیاب چکشی، میکسر، کاندیشنر، کرامبلر و خشک‌کن تونلی',
    iconName: 'Factory',
    problemSolved: 'کیفیت پایین پلت، عدم یکنواختی مخلوط مواد دارویی، استهلاک بالای دای و قطعات در خطوط خوراک.',
    whatWeProvide: [
      'طراحی و تولید پرس پلت‌های گیربکسی با شاخص دوام PDI بالای ۹۶٪',
      'تولید سیستم میکرودایزینگ جهت اندازه‌گیری دقیق ویتامین‌ها و میکروارگانیسم‌ها',
      'ساخت اکسترودر آبزیان، فلیکر خوراک اسب و خشک‌کن تونلی پت‌فود',
      'تولید آسیاب چکشی، میکسر دوشفت، کاندیشنر استیل، کرامبلر و کولر درایر'
    ],
    workflow: [
      { stepNumber: 1, title: 'طراحی فرآیند تولید', description: 'تعیین ظرفیت تن/ساعت و جانمایی ماشین‌آلات در برج تولید', deliverable: 'دیاگرام فرآیند P&ID' },
      { stepNumber: 2, title: 'ساخت و کنترل کیفی ماشین‌آلات', description: 'تراشکاری CNC، سخت‌کاری حرارتی و بالانس روتورها', deliverable: 'تست کارگاهی ماشین‌آلات' },
      { stepNumber: 3, title: 'نصب، راه‌اندازی و آموزش', description: 'مونتاژ خط، کالیبراسیون و آموزش اپراتورهای کارخانه', deliverable: 'خط در حال تولید پایدار' }
    ],
    suitableFor: ['کارخانجات تولید خوراک دام، طیور، آبزیان، پت فود و مکمل‌سازی'],
    relatedEquipmentCategories: ['machinery'],
    sampleProjectIds: ['proj-feed-mill-damoon', 'proj-aqua-feed-plant'],
    faqs: [
      {
        q: 'آیا قطعات یدکی دای، رولر و چکش‌ها همواره موجود است؟',
        a: 'بله، انبار مرکزی کارخانجات طیوران صنعت پویا قطعات مصرفی و یدکی فابریک تمامی ماشین‌آلات را همواره تأمین می‌نماید.'
      }
    ]
  },
  {
    id: 'srv-poultry-equipment-supply',
    title: 'تأمین و نصب تجهیزات تخصصی دام و طیور',
    tagline: 'تولیدکننده بشقاب‌های دانخوری پروانه‌ای و تجهیزات آبخوری TSPK',
    iconName: 'Wrench',
    problemSolved: 'هدررفت دان، خیس شدن بستر با نیپل‌های نامرغوب و افت بهره‌وری گله در سالن‌های مرغداری.',
    whatWeProvide: [
      'تجهیز دانخوری پروانه‌ای',
      'تأمین بشقاب‌های پویا، پارس و کناوی (Konavi) و خطوط انتقال دان',
      'تجهیز سیستم آبخوری نیپل TSPK کارنو تمام استیل با فشارشکن و کاپ دوپایه Sدار',
      'تولید و نصب جت هیترهای ۱۰۰ و ۵۰ (گازی، گازوئیلی، دوگانه)، اینلت و هواکش ۱۴۰'
    ],
    workflow: [
      { stepNumber: 1, title: 'محاسبه خطوط بر اساس ابعاد سالن', description: 'تعیین تعداد خطوط دان و آب و توان گرمایشی و تهویه', deliverable: 'استعلام قیمت رسمی و نقشه چیدمان' },
      { stepNumber: 2, title: 'ارسال مستقیم از کارخانه', description: 'بسته‌بندی ایمن و ارسال تجهیزات اصل به فارم', deliverable: 'تحویل در محل پروژه' },
      { stepNumber: 3, title: 'نصب، تراز و راه‌اندازی', description: 'نصب با وینچ‌های سقفی، کالیبراسیون فشار آب و سنسور دان', deliverable: 'تست عملکرد' }
    ],
    suitableFor: ['مرغداری‌های گوشتی، تخم‌گذار، مزارع مادر و بوقلمون'],
    relatedEquipmentCategories: ['feeding', 'drinking', 'ventilation'],
    sampleProjectIds: ['proj-broiler-novin-120k', 'proj-layer-negin-150k'],
    faqs: [
      {
        q: 'تفاوت بشقاب پروانه‌ای با بشقاب‌های معمولی چیست؟',
        a: 'به دلیل طراحی ارگونومیک بشقاب پروانه‌ای، جوجه از روز اول بدون نیاز به سینی دان از آن تغذیه می‌کند و هدررفت دان بین ۳ تا ۵ درصد کاهش می‌یابد.'
      }
    ]
  },
  {
    id: 'srv-feed-formulation-pharma',
    title: 'تولید خوراک، کنسانتره، جایگزین‌های نهاده، روغن و دارو',
    tagline: 'کنسانتره Mac، جایگزین‌های ذرت و جو، پریمیکس دامی و اسب، روغن خام سویا/آفتابگردان و دارو',
    iconName: 'Pill',
    problemSolved: 'نوسانات قیمت نهاده‌ها، کمبود دان باکیفیت و بیماری‌های ناشی از ضعف تغذیه در گله.',
    whatWeProvide: [
      'تولید جایگزین‌های ذرت و جو برای کارخانجات تولید خوراک جهت کاهش هزینه‌ها',
      'تولید کنسانتره تخصصی Mac و تخم‌گذار (۲.۵ درصد و ۵ درصد) و دان آماده مک',
      'تأمین پریمیکس‌های دامی و اسب، شیرافزا و آنتی‌بیوتیک‌های درمانی',
      'تولید روغن خام سویا، روغن خام آفتابگردان، اسید چرب و پودر گوشت (دامی، طیور، ماهی)'
    ],
    workflow: [
      { stepNumber: 1, title: 'آنالیز نیاز تغذیه‌ای گله', description: 'بررسی نژاد، سن و اهداف وزنی یا تخم‌گذاری', deliverable: 'فرمول اختصاصی بهینه' },
      { stepNumber: 2, title: 'تولید تحت نظارت آزمایشگاهی', description: 'ترکیب دقیق در خطوط استاندارد کارخانه', deliverable: 'محصول با آنالیز تضمین‌شده' },
      { stepNumber: 3, title: 'پایش مستمر نتایج در فارم', description: 'بررسی شاخص FCR و سلامت گله در طول دوره', deliverable: 'گزارش ارتقای راندمان' }
    ],
    suitableFor: ['بهره‌برداران واحدهای مرغداری، دامداران، پرورش‌دهندگان اسب و کارخانجات خوراک'],
    relatedEquipmentCategories: ['feed_pharma'],
    sampleProjectIds: ['proj-broiler-novin-120k'],
    faqs: [
      {
        q: 'چگونه جایگزین‌های ذرت و جو به کاهش هزینه‌ها کمک می‌کنند؟',
        a: 'با بالانس علمی اسیدهای آمینه و منابع انرژی فرآوری‌شده، بدون افت عملکرد گله، هزینه تمام‌شده خوراک به طور چشمگیری کاهش می‌یابد.'
      }
    ]
  },
  {
    id: 'srv-consulting-efficiency',
    title: 'مشاوره توسعه، بهره‌برداری و افزایش راندمان صنعتی',
    tagline: 'راهکار جامع توسعه، تجهیز و بهره‌برداری با بیش از ۵۰ سال تجربه و مجری بیش از ۲۰۰ پروژه ملی و بین‌المللی',
    iconName: 'TrendingUp',
    problemSolved: 'بهره‌برداری غیراقتصادی، خطاهای مدیریتی در اقلیم و تغذیه و افت سودآوری پروژه‌های صنعتی.',
    whatWeProvide: [
      'بیش از ۵۰ سال تجربه مهندسی در صنعت دام، طیور و آبزیان',
      'تجارب حاصل از اجرای بیش از ۲۰۰ پروژه بزرگ ملی و بین‌المللی',
      'ممیزی کامل تهویه، مدیریت بستر، برنامه‌های نوری و بهینه‌سازی مصرف سوخت',
      'مشاوره امکان‌سنجی اقتصادی، انتخاب ماشین‌آلات و اخذ مجوزهای جهاد کشاورزی'
    ],
    workflow: [
      { stepNumber: 1, title: 'عارضه‌یابی و ممیزی میدانی', description: 'بازدید کارشناسان ارشد از فارم یا کارخانه', deliverable: 'گزارش ارزیابی نقاط ضعف و قوت' },
      { stepNumber: 2, title: 'تدوین پروتکل بهبود راندمان', description: 'ارائه برنامه زمان‌بندی اصلاح تجهیزات و مدیریت', deliverable: 'پروتکل جامع افزایش سودآوری' },
      { stepNumber: 3, title: 'نظارت بر اجرا و پشتیبانی', description: 'همراهی تیم مهندسی تا دستیابی به تارگت‌های تولیدی', deliverable: 'تثبیت شاخص‌های برتر تولید' }
    ],
    suitableFor: ['مدیران و سرمایه‌گذاران مزارع پرورش و کارخانجات فرآوری'],
    relatedEquipmentCategories: ['structure', 'heating', 'feeding', 'ventilation'],
    sampleProjectIds: ['proj-broiler-novin-120k', 'proj-feed-mill-damoon'],
    faqs: [
      {
        q: 'دفاتر مهندسی و تحقیق و توسعه شرکت در چه شهرهایی مستقر هستند؟',
        a: 'دفتر تحقیق و توسعه در دانشگاه منابع طبیعی گرگان و دفتر مرکزی و کارخانجات شرکت در مشهد مستقر می‌باشند و به سراسر کشور و پروژه‌های بین‌المللی خدمات ارائه می‌دهند.'
      }
    ]
  }
];

// Public bundle ships no seed articles; the magazine reads /api/magazine.
// Seed copies live in ./seedArticles (server fallback + admin reset only).
export const ARTICLES: Article[] = [];

export const TESTIMONIALS_AND_PROOF = [
  {
    author: 'مهندس احمدی',
    role: 'مدیرعامل مجتمع پرورش طیور نوین فارم',
    location: 'مازندران',
    text: 'استفاده از بشقاب‌های پروانه‌ای باعث شد تلفات هفته اول ما به حداقل برسد و بدون سینی دستی، جوجه‌ها از روز اول به دان دسترسی عالی داشته باشند.',
  },
  {
    author: 'دکتر علیزاده',
    role: 'مدیر فنی کارخانه خوراک دامون',
    location: 'مشهد',
    text: 'سیستم میکرودایزینگ و پرس پلت‌های شرکت طیوران صنعت پویا یکنواختی مخلوط مکمل‌ها و سختی پلت ما را به استاندارد صادراتی رساندند. پشتیبانی ۵۰ ساله این مجموعه واقعاً مایه اطمینان است.',
  },
  {
    author: 'مهندس رضایی',
    role: 'مدیر فارم تخم‌گذار نگین',
    location: 'اصفهان',
    text: 'جت هیترهای تخصصی و سیستم آبخوری نیپل TSPK کارنو با کمترین استهلاک و بدون هیچ‌گونه چکه آب، بستر سالن‌های ما را در اوج زمستان کاملاً خشک نگه داشتند.',
  }
];

export const DEFAULT_HERO_CMS = {
  title: 'طیوران صنعت پویا',
  subtitle: 'طراح، مجری و مشاور توسعه و بهره‌برداری پروژه‌های صنعت دام، طیور و آبزیان',
  pillText: 'نیم قرن تجربه · بیش از ۲۰۰ پروژهٔ ملی و بین‌المللی',
  ctaPrimaryText: 'درخواست مشاورهٔ رایگان',
  ctaSecondaryText: 'مشاهدهٔ محصولات',
  backgroundImage: '/images/hero-1.jpg'
};

export const DEFAULT_AI_CONFIG = {
  systemPrompt: `شما «دستیار مهندسی و هوش مصنوعی طیوران صنعت پویا» هستید. شما متخصص طراحی سالن‌های مرغداری گوشتی، تخم‌گذار، مادر، خطوط تولید خوراک دام و طیور، محاسبات تهویه (اینلت، پد سلولزی، هواکش)، سیستم‌های دانخوری بشقابی پروانه‌ای، سیستم‌های آبخوری نیپل استیل TSPK و جت هیترهای صنعتی هستید.
وظیفه شما پاسخ دقیق، علمی و مهندسی به زبان فارسی روان، مودبانه و تخصصی است. در صورت نیاز به استعلام قیمت، کاربران را به ثبت درخواست استعلام قیمت یا تماس با دفاتر طیوران صنعت پویا هدایت کنید.`,
  welcomeMessage: 'سلام و احترام؛ من دستیار هوشمند فنی و مهندسی طیوران صنعت پویا هستم. چطور می‌توانم در زمینه محاسبات تهویه، انتخاب ماشین‌آلات خوراک، ظرفیت‌سنجی فارم و تجهیزات سالن به شما کمک کنم؟',
  suggestions: [
    'محاسبه تعداد هواکش و اینلت برای سالن مرغداری گوشتی با ظرفیت ۳۰ هزار قطعه',
    'مزایای بشقاب پروانه‌ای نسبت به بشقاب‌های سنتی چیست؟',
    'تجهیزات اصلی مورد نیاز برای خط تولید خوراک پلت با ظرفیت ۵ تن در ساعت',
    'روش تنظیم جت هیتر و مدیریت رطوبت در فصول سرد سال'
  ]
};

export const INITIAL_QUOTES: import('../types').QuoteRequestItem[] = [];

export const INITIAL_CONSULTATIONS: import('../types').ConsultationRequestItem[] = [];


export const INITIAL_MEDIA = [
  { id: 'img-casestudy', url: '/images/article_casestudy_1787988026030.jpg', title: 'نمای بیرونی مجتمع مرغداری گوشتی ۱۰۰ هزار قطعه‌ای', createdAt: new Date().toISOString() },
  { id: 'img-costs', url: '/images/article_costs_1787988037875.jpg', title: 'سیلوهای ذخیره و خطوط انتقال دان', createdAt: new Date().toISOString() },
  { id: 'img-design', url: '/images/article_design_1787987990156.jpg', title: 'نمای داخلی سالن مرغداری پیش از جوجه‌ریزی', createdAt: new Date().toISOString() },
  { id: 'img-feeder', url: '/images/article_feeder_1787988014850.jpg', title: 'دانخوری‌های پروانه‌ای برای جوجه یک‌روزه', createdAt: new Date().toISOString() },
  { id: 'img-heating', url: '/images/article_heating_1787988003088.jpg', title: 'جت هیتر صنعتی نصب‌شده در سقف', createdAt: new Date().toISOString() },
  { id: 'img-renovation', url: '/images/article_renovation_1787988050732.jpg', title: 'آبخوری‌های نیپل استیل براق و مدرن', createdAt: new Date().toISOString() },
  { id: 'img-ventilation', url: '/images/article_ventilation_1787987977267.jpg', title: 'نمای هواکش‌ها و پدهای سلولزی در مرغداری', createdAt: new Date().toISOString() }
];
