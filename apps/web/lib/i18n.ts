// Central translation dictionary for NR MotorMarket.
//
// This file is the SOURCE OF TRUTH for all customer-facing UI copy across
// English, Khmer, and Simplified Chinese. The mobile app (apps/mobile) keeps
// its own copy of this file in sync by hand — if you add/change/remove a
// key here, mirror the change there too.
//
// Khmer and Simplified Chinese translations are machine-generated and
// should be reviewed by a native speaker before launch.
//
// Conventions:
// - Keys are dot-namespaced strings grouped by the section/component they
//   belong to (nav.*, hero.*, trust.*, valueProps.*, inventory.*,
//   financing.*, tradeIn.*, footer.*, listing.*, common.*). This is a FLAT
//   map — "inventory.type" and "inventory.type.car" are two independent
//   string keys, not a nested object, so there's no collision.
// - Brand name ("NR MotorMarket"), dynamic listing data (make/model/year/
//   description/price), and proper nouns (car brand names in BrandStrip)
//   are never translated — they aren't in this dictionary.
// - Where the English copy embeds a trailing arrow ("→") or a leading icon,
//   the arrow/icon is usually kept as static JSX and only the text itself
//   is a translation key, so translations don't need to carry directional
//   glyphs.

export type Lang = "en" | "km" | "zh";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "km", label: "ខ្មែរ" },
  { code: "zh", label: "中文" },
];

export const translations: Record<string, Record<Lang, string>> = {
  // ---- common (shared across header/footer) ----
  "common.tagline": {
    en: "Find your perfect ride.",
    km: "ស្វែងរករថយន្តដ៏ល្អឥតខ្ចោះសម្រាប់អ្នក។",
    zh: "寻找您的完美座驾。",
  },
  "common.location": {
    en: "📍 Phnom Penh, Cambodia",
    km: "📍 ភ្នំពេញ កម្ពុជា",
    zh: "📍 柬埔寨金边",
  },

  // ---- nav (SiteHeader) ----
  "nav.home": { en: "Home", km: "ទំព័រដើម", zh: "首页" },
  "nav.inventory": { en: "Inventory", km: "ស្តុកទំនិញ", zh: "库存车辆" },
  "nav.financing": { en: "Financing", km: "ហិរញ្ញប្បទាន", zh: "融资" },
  "nav.aboutUs": { en: "About Us", km: "អំពីយើង", zh: "关于我们" },
  "nav.adminAccess": {
    en: "Admin Access",
    km: "សិទ្ធិចូលប្រើអ្នកគ្រប់គ្រង",
    zh: "管理员入口",
  },

  // ---- hero (HeroCarousel) ----
  "hero.eyebrow": {
    en: "Featured Inventory",
    km: "ស្តុកទំនិញពិសេស",
    zh: "精选车辆",
  },
  "hero.readyToDriveSuffix": {
    en: "— ready to drive today.",
    km: "— ត្រៀមខ្លួនបើកបរបានភ្លាមៗ។",
    zh: "——即刻可提车上路。",
  },
  "hero.financingAvailable": {
    en: "Financing Available",
    km: "មានផ្តល់ហិរញ្ញប្បទាន",
    zh: "提供分期付款",
  },
  "hero.viewDetails": {
    en: "View Details",
    km: "មើលព័ត៌មានលម្អិត",
    zh: "查看详情",
  },
  "hero.bookTestDrive": {
    en: "Book a Test Drive",
    km: "កក់ការសាកបើកបរ",
    zh: "预约试驾",
  },
  "hero.fallbackTitlePrefix": {
    en: "Drive Your",
    km: "បើកបរ",
    zh: "驾驭您的",
  },
  "hero.fallbackTitleHighlight": {
    en: "Dream",
    km: "សុបិន្តរបស់អ្នក",
    zh: "梦想座驾",
  },
  "hero.fallbackSubtitle": {
    en: "Unbeatable prices on premium pre-owned vehicles.",
    km: "តម្លៃដ៏ប្រកួតប្រជែងសម្រាប់រថយន្តគុណភាពខ្ពស់ដែលបានប្រើប្រាស់រួច។",
    zh: "优质二手车,超值价格。",
  },
  "hero.pauseSlideshow": {
    en: "Pause slideshow",
    km: "ផ្អាកការបញ្ចាំងស្លាយ",
    zh: "暂停幻灯片",
  },
  "hero.playSlideshow": {
    en: "Play slideshow",
    km: "ចាក់ការបញ្ចាំងស្លាយ",
    zh: "播放幻灯片",
  },
  "hero.goToSlide": {
    en: "Go to slide",
    km: "ទៅកាន់ស្លាយ",
    zh: "转到幻灯片",
  },
  "hero.previousSlide": {
    en: "Previous slide",
    km: "ស្លាយមុន",
    zh: "上一张",
  },
  "hero.nextSlide": {
    en: "Next slide",
    km: "ស្លាយបន្ទាប់",
    zh: "下一张",
  },

  // ---- trust (TrustStrip) ----
  "trust.inspected": {
    en: "Every Vehicle Inspected",
    km: "រថយន្តគ្រប់គ្រាន់ត្រូវបានត្រួតពិនិត្យ",
    zh: "每辆车均经过检测",
  },
  "trust.financing": {
    en: "Financing · All Credit",
    km: "ហិរញ្ញប្បទាន · គ្រប់ប្រវត្តិឥណទាន",
    zh: "融资・不限信用记录",
  },
  "trust.cashOffers": {
    en: "24-Hour Cash Offers",
    km: "ផ្តល់ជូនសាច់ប្រាក់ក្នុងរយៈពេល ២៤ម៉ោង",
    zh: "24小时现金报价",
  },
  "trust.pricing": {
    en: "Transparent Pricing",
    km: "តម្លៃច្បាស់លាស់",
    zh: "价格透明",
  },
  "trust.locallyOwned": {
    en: "Locally Owned · Phnom Penh",
    km: "ជាកម្មសិទ្ធិមូលដ្ឋាន · ភ្នំពេញ",
    zh: "本地经营・金边",
  },

  // ---- valueProps (ValueProps) ----
  "valueProps.eyebrow": {
    en: "Why NR MotorMarket",
    km: "ហេតុអ្វីជ្រើសរើស NR MotorMarket",
    zh: "为何选择 NR MotorMarket",
  },
  "valueProps.heading": {
    en: "The easiest way to your next ride",
    km: "មធ្យោបាយងាយស្រួលបំផុតទៅកាន់រថយន្តបន្ទាប់របស់អ្នក",
    zh: "让您轻松拥有下一辆座驾",
  },
  "valueProps.search.title": {
    en: "Search Inventory",
    km: "ស្វែងរកស្តុកទំនិញ",
    zh: "浏览库存车辆",
  },
  "valueProps.search.body": {
    en: "Every vehicle is inspected for reliability before it hits the lot. Browse cars and motorcycles you can trust.",
    km: "រថយន្តគ្រប់គ្រាន់ត្រូវបានត្រួតពិនិត្យភាពជឿទុកចិត្តមុននឹងដាក់លក់។ រកមើលរថយន្ត និងម៉ូតូដែលអ្នកអាចទុកចិត្តបាន។",
    zh: "每辆车上架前都经过可靠性检测。浏览值得信赖的汽车和摩托车。",
  },
  "valueProps.visit.title": {
    en: "Visit the Showroom",
    km: "ចូលមកទស្សនាកន្លែងតាំងបង្ហាញ",
    zh: "参观展厅",
  },
  "valueProps.visit.body": {
    en: "No pressure, no gimmicks. Come see every vehicle in person at our Phnom Penh showroom and take it for a spin.",
    km: "គ្មានការបង្ខិតបង្ខំ គ្មានល្បិចកលអ្វីទាំងអស់។ សូមអញ្ជើញមកមើលរថយន្តគ្រប់គ្រាន់ដោយផ្ទាល់នៅកន្លែងតាំងបង្ហាញរបស់យើងនៅភ្នំពេញ ហើយសាកបើកបរមើល។",
    zh: "没有推销压力,没有套路。欢迎亲临我们位于金边的展厅,近距离查看每辆车并试驾。",
  },
  "valueProps.testDrive.title": {
    en: "Book a Test Drive",
    km: "កក់ការសាកបើកបរ",
    zh: "预约试驾",
  },
  "valueProps.testDrive.body": {
    en: "The best way to decide is to feel it. Reserve a test drive online in under a minute.",
    km: "វិធីល្អបំផុតដើម្បីសម្រេចចិត្តគឺការសាកល្បងដោយខ្លួនឯង។ កក់ការសាកបើកបរតាមអនឡាញក្នុងរយៈពេលមិនដល់មួយនាទី។",
    zh: "亲身体验才是最好的决定方式。在线预约试驾,不到一分钟即可完成。",
  },

  // ---- inventory (page.tsx grid + InventoryCard) ----
  "inventory.eyebrow": {
    en: "Latest Arrivals",
    km: "រថយន្តចូលថ្មីៗ",
    zh: "最新到店",
  },
  "inventory.heading": {
    en: "Featured inventory",
    km: "ស្តុកទំនិញពិសេស",
    zh: "精选库存车辆",
  },
  "inventory.searchPlaceholder": {
    en: "Search make, model, or year...",
    km: "ស្វែងរកម៉ាក ម៉ូដែល ឬឆ្នាំ...",
    zh: "搜索品牌、型号或年份...",
  },
  "inventory.maxPricePlaceholder": {
    en: "Max price ($)",
    km: "តម្លៃអតិបរមា ($)",
    zh: "最高价格 ($)",
  },
  "inventory.filter.all": { en: "All", km: "ទាំងអស់", zh: "全部" },
  "inventory.filter.cars": { en: "Cars", km: "រថយន្ត", zh: "汽车" },
  "inventory.filter.motorcycles": {
    en: "Motorcycles",
    km: "ម៉ូតូ",
    zh: "摩托车",
  },
  "inventory.noResults.title": {
    en: "No vehicles found",
    km: "រកមិនឃើញរថយន្តទេ",
    zh: "未找到符合条件的车辆",
  },
  "inventory.noResults.body": {
    en: "We couldn't find any matches for your current filters.",
    km: "យើងមិនអាចរកឃើញលទ្ធផលដែលត្រូវនឹងតម្រងបច្ចុប្បន្នរបស់អ្នកទេ។",
    zh: "没有符合当前筛选条件的车辆。",
  },
  "inventory.clearFilters": {
    en: "Clear Filters",
    km: "សម្អាតតម្រង",
    zh: "清除筛选",
  },
  "inventory.loading": {
    en: "Loading inventory...",
    km: "កំពុងផ្ទុកស្តុកទំនិញ...",
    zh: "正在加载库存...",
  },
  "inventory.type.car": { en: "Car", km: "រថយន្ត", zh: "汽车" },
  "inventory.type.motorcycle": { en: "Motorcycle", km: "ម៉ូតូ", zh: "摩托车" },
  "inventory.year": { en: "Year", km: "ឆ្នាំ", zh: "年份" },
  "inventory.type": { en: "Type", km: "ប្រភេទ", zh: "类型" },
  "inventory.view": { en: "View", km: "មើល", zh: "查看" },
  "inventory.contact": { en: "Contact", km: "ទាក់ទង", zh: "联系" },
  "inventory.noPhoto": { en: "No Photo", km: "គ្មានរូបភាព", zh: "暂无图片" },

  // ---- financing (FinancingBand) ----
  "financing.eyebrow": {
    en: "Financing",
    km: "ហិរញ្ញប្បទាន",
    zh: "融资方案",
  },
  "financing.heading": {
    en: "Get pre-approved in minutes",
    km: "ទទួលបានការអនុម័តជាមុនក្នុងរយៈពេលប៉ុន្មាននាទី",
    zh: "几分钟内获得预批",
  },
  "financing.body": {
    en: "Good credit, bad credit, first-time buyer — we work with multiple lenders to get you behind the wheel. No pressure, no obligation.",
    km: "ប្រវត្តិឥណទានល្អ ឬមិនល្អ ជាអ្នកទិញលើកដំបូង — យើងធ្វើការជាមួយស្ថាប័នផ្តល់កម្ចីច្រើនដើម្បីជួយអ្នកឱ្យទទួលបានរថយន្ត។ គ្មានការបង្ខិតបង្ខំ គ្មានកាតព្វកិច្ចអ្វីទាំងអស់។",
    zh: "无论信用记录好坏,还是首次购车,我们都与多家贷款机构合作,助您轻松拥车。无推销压力,无任何义务。",
  },
  "financing.point.allCredit": {
    en: "All credit welcome",
    km: "ទទួលគ្រប់ប្រវត្តិឥណទាន",
    zh: "不限信用记录",
  },
  "financing.point.softCheck": {
    en: "Soft check, no score impact",
    km: "ការត្រួតពិនិត្យស្រាល មិនប៉ះពាល់ពិន្ទុឥណទាន",
    zh: "软查询,不影响信用评分",
  },
  "financing.point.quickDecision": {
    en: "Quick decision",
    km: "សម្រេចចិត្តលឿន",
    zh: "快速审批",
  },
  "financing.panel.heading": {
    en: "No Pressure, No Obligation",
    km: "គ្មានការបង្ខិតបង្ខំ គ្មានកាតព្វកិច្ច",
    zh: "无压力,无义务",
  },
  "financing.panel.item1": {
    en: "Multiple lenders compared for you",
    km: "ប្រៀបធៀបស្ថាប័នផ្តល់កម្ចីច្រើនសម្រាប់អ្នក",
    zh: "为您比较多家贷款机构",
  },
  "financing.panel.item2": {
    en: "Clear terms, explained plainly",
    km: "លក្ខខណ្ឌច្បាស់លាស់ ពន្យល់យ៉ាងសាមញ្ញ",
    zh: "条款清晰,简单易懂",
  },
  "financing.panel.item3": {
    en: "Walk away anytime, no cost",
    km: "អាចដកខ្លួនចេញពេលណាក៏បាន ដោយមិនចាំបាច់ចំណាយ",
    zh: "随时可退出,无需任何费用",
  },
  "financing.cta": {
    en: "Apply Now",
    km: "ដាក់ពាក្យឥឡូវនេះ",
    zh: "立即申请",
  },

  // ---- tradeIn (TradeIn) ----
  "tradeIn.eyebrow": {
    en: "Trade-In & Sell",
    km: "លក់ដូរ និងលក់រថយន្ត",
    zh: "以旧换新与卖车",
  },
  "tradeIn.heading": {
    en: "We buy cars — even if you don't buy from us",
    km: "យើងទិញរថយន្ត — ទោះបីអ្នកមិនទិញពីយើងក៏ដោយ",
    zh: "我们收购车辆——即使您不向我们购车",
  },
  "tradeIn.body": {
    en: "Skip the DMV hassle. Get a real cash offer for your current vehicle in 24 hours, and put it straight toward your next one.",
    km: "រំលងបញ្ហាការិយាល័យចុះបញ្ជីយានយន្ត។ ទទួលបានការផ្តល់ជូនសាច់ប្រាក់ពិតប្រាកដសម្រាប់រថយន្តបច្ចុប្បន្នរបស់អ្នកក្នុងរយៈពេល ២៤ម៉ោង ហើយប្រើប្រាស់វាភ្លាមៗសម្រាប់រថយន្តបន្ទាប់។",
    zh: "省去繁琐的过户手续。24小时内获得您爱车的真实现金报价,直接抵扣下一辆车的购车款。",
  },
  "tradeIn.cta": {
    en: "Value My Car",
    km: "វាយតម្លៃរថយន្តខ្ញុំ",
    zh: "评估我的车",
  },

  // ---- footer (Footer) ----
  "footer.tagline": {
    en: "Premium pre-owned cars & motorcycles, inspected and ready to drive. Phnom Penh, Cambodia.",
    km: "រថយន្ត និងម៉ូតូគុណភាពខ្ពស់ដែលបានប្រើប្រាស់រួច ត្រូវបានត្រួតពិនិត្យ និងត្រៀមខ្លួនបើកបរ។ ភ្នំពេញ កម្ពុជា។",
    zh: "优质二手汽车与摩托车,经过检测,随时可上路。柬埔寨金边。",
  },
  "footer.shop.heading": { en: "Shop", km: "ទំនិញ", zh: "商城" },
  "footer.shop.allInventory": {
    en: "All Inventory",
    km: "ស្តុកទំនិញទាំងអស់",
    zh: "全部库存",
  },
  "footer.shop.cars": { en: "Cars", km: "រថយន្ត", zh: "汽车" },
  "footer.shop.motorcycles": { en: "Motorcycles", km: "ម៉ូតូ", zh: "摩托车" },
  "footer.shop.newArrivals": {
    en: "New Arrivals",
    km: "ទំនិញចូលថ្មី",
    zh: "新到车辆",
  },
  "footer.company.heading": { en: "Company", km: "ក្រុមហ៊ុន", zh: "公司" },
  "footer.company.aboutUs": { en: "About Us", km: "អំពីយើង", zh: "关于我们" },
  "footer.company.financing": {
    en: "Financing",
    km: "ហិរញ្ញប្បទាន",
    zh: "融资方案",
  },
  "footer.company.tradeIn": {
    en: "Trade-In",
    km: "លក់ដូររថយន្ត",
    zh: "以旧换新",
  },
  "footer.company.contact": { en: "Contact", km: "ទាក់ទង", zh: "联系我们" },
  "footer.visit.heading": { en: "Visit", km: "ទីតាំង", zh: "门店信息" },
  "footer.visit.location": { en: "Phnom Penh", km: "ភ្នំពេញ", zh: "金边" },
  "footer.visit.hours": {
    en: "Mon–Sat · 8am–7pm",
    km: "ចន្ទ–សៅរ៍ · ៨ព្រឹក–៧ល្ងាច",
    zh: "周一至周六・上午8点至晚上7点",
  },
  "footer.copyright": {
    en: "© 2026 NR MotorMarket.",
    km: "© ២០២៦ NR MotorMarket។",
    zh: "© 2026 NR MotorMarket。",
  },

  // ---- listing (app/listing/[id]/page.tsx) ----
  "listing.backToInventory": {
    en: "Back to Inventory",
    km: "ត្រឡប់ទៅស្តុកទំនិញ",
    zh: "返回库存列表",
  },
  "listing.vehicleNotFound": {
    en: "Vehicle Not Found",
    km: "រកមិនឃើញរថយន្ត",
    zh: "未找到该车辆",
  },
  "listing.condition": {
    en: "Condition: New",
    km: "ស្ថានភាព៖ ថ្មី",
    zh: "车况:全新",
  },
  "listing.msrp": {
    en: "MSRP",
    km: "តម្លៃលក់រាយដែលផ្តល់អនុសាសន៍",
    zh: "厂商建议零售价",
  },
  "listing.status": { en: "Status", km: "ស្ថានភាព", zh: "状态" },
  "listing.inStock": { en: "In-Stock", km: "នៅមានស្តុក", zh: "现货" },
  "listing.seller": { en: "Seller", km: "អ្នកលក់", zh: "卖家" },
  "listing.stockNumber": { en: "Stock #", km: "លេខស្តុក", zh: "库存编号" },
  "listing.contactSeller": {
    en: "Contact Seller",
    km: "ទាក់ទងអ្នកលក់",
    zh: "联系卖家",
  },
  "listing.makeOffer": { en: "Make Offer", km: "ស្នើតម្លៃ", zh: "出价" },
  "listing.testRide": {
    en: "Test Ride",
    km: "សាកបើកបរ",
    zh: "试驾/试骑",
  },
  "listing.tabs.overview": {
    en: "Overview",
    km: "ទិដ្ឋភាពទូទៅ",
    zh: "概览",
  },
  "listing.tabs.specs": {
    en: "Specifications",
    km: "សេចក្តីលម្អិតបច្ចេកទេស",
    zh: "规格参数",
  },
  "listing.tabs.features": {
    en: "Key Features",
    km: "លក្ខណៈពិសេស",
    zh: "主要特点",
  },
  "listing.vehicleDescription": {
    en: "Vehicle Description",
    km: "សេចក្តីពិពណ៌នារថយន្ត",
    zh: "车辆描述",
  },
  "listing.noDescription": {
    en: "No description provided by the seller.",
    km: "អ្នកលក់មិនបានផ្តល់សេចក្តីពិពណ៌នាទេ។",
    zh: "卖家未提供车辆描述。",
  },
  "listing.technicalSpecs": {
    en: "Technical Specifications",
    km: "សេចក្តីលម្អិតបច្ចេកទេស",
    zh: "技术规格",
  },
  "listing.engine.heading": { en: "Engine", km: "ម៉ាស៊ីន", zh: "发动机" },
  "listing.engine.type.label": { en: "Type", km: "ប្រភេទ", zh: "类型" },
  "listing.engine.type.value": {
    en: "Liquid-Cooled Inline Four",
    km: "ម៉ាស៊ីនបួនស៊ីឡាំងត្រង់ត្រជាក់ដោយសារធាតុរាវ",
    zh: "水冷直列四缸",
  },
  "listing.engine.displacement.label": {
    en: "Displacement",
    km: "ចំណុះម៉ាស៊ីន",
    zh: "排量",
  },
  "listing.engine.displacement.value": {
    en: "599cc",
    km: "៥៩៩ស៊ីស៊ី",
    zh: "599cc",
  },
  "listing.engine.transmission.label": {
    en: "Transmission",
    km: "ប្រអប់លេខ",
    zh: "变速箱",
  },
  "listing.engine.transmission.value": {
    en: "Close-ratio 6-speed",
    km: "ប្រអប់លេខ៦ល្បឿនអត្រាជិត",
    zh: "六速密齿比变速箱",
  },
  "listing.dimensions.heading": {
    en: "Dimensions",
    km: "វិមាត្រ",
    zh: "尺寸",
  },
  "listing.dimensions.seatHeight.label": {
    en: "Seat Height",
    km: "កម្ពស់កៅអី",
    zh: "座高",
  },
  "listing.dimensions.seatHeight.value": {
    en: "32.4 inches",
    km: "៣២,៤ អ៊ីង",
    zh: "32.4英寸",
  },
  "listing.dimensions.fuelCapacity.label": {
    en: "Fuel Capacity",
    km: "ចំណុះធុងសាំង",
    zh: "油箱容量",
  },
  "listing.dimensions.fuelCapacity.value": {
    en: "4.8 gallons",
    km: "៤,៨ហ្គាឡុង",
    zh: "4.8加仑",
  },
  "listing.dimensions.curbWeight.label": {
    en: "Curb Weight",
    km: "ទម្ងន់ទទេ",
    zh: "整备质量",
  },
  "listing.dimensions.curbWeight.value": {
    en: "419 lbs",
    km: "៤១៩ផោន",
    zh: "419磅",
  },
  "listing.specsDisclaimer": {
    en: "* Specifications shown are representative examples. Actual vehicle specs may vary.",
    km: "* សេចក្តីលម្អិតបច្ចេកទេសដែលបង្ហាញនេះគឺជាឧទាហរណ៍តំណាងតែប៉ុណ្ណោះ។ សេចក្តីលម្អិតជាក់ស្តែងរបស់រថយន្តអាចខុសគ្នា។",
    zh: "* 以上规格仅为示例参考,实际车辆规格可能有所不同。",
  },
  "listing.highlightedFeatures": {
    en: "Highlighted Features",
    km: "លក្ខណៈពិសេសសំខាន់ៗ",
    zh: "重点特色",
  },
  "listing.feature1.title": {
    en: "Advanced Aerodynamics",
    km: "ក្បួនខ្យល់កម្រិតខ្ពស់",
    zh: "先进空气动力学设计",
  },
  "listing.feature1.body": {
    en: "Designed to reduce drag and increase high-speed stability on the track or the street.",
    km: "រចនាឡើងដើម្បីកាត់បន្ថយសម្ពាធខ្យល់ និងបង្កើនស្ថេរភាពល្បឿនលឿននៅលើផ្លូវ ឬសៀគ្វី។",
    zh: "旨在降低风阻,提升赛道与公路上的高速稳定性。",
  },
  "listing.feature2.title": {
    en: "Electronic Steering Damper",
    km: "ឧបករណ៍បន្ធូរការបង្វិលបញ្ជាអេឡិចត្រូនិក",
    zh: "电子转向阻尼器",
  },
  "listing.feature2.body": {
    en: "Automatically adjusts damping force based on vehicle speed for optimal handling.",
    km: "លៃតម្រូវកម្លាំងបន្ធូរដោយស្វ័យប្រវត្តិទៅតាមល្បឿនរថយន្ត ដើម្បីការបញ្ជាដ៏ល្អប្រសើរ។",
    zh: "根据车速自动调整阻尼力,实现最佳操控性能。",
  },
  "listing.feature3.title": {
    en: "Radial-Mounted Brakes",
    km: "ហ្វ្រាំងម៉ោនតាមបែបរ៉ាឌីយ៉ាល់",
    zh: "径向安装制动系统",
  },
  "listing.feature3.body": {
    en: "Provides superior feel and immense stopping power when you need it most.",
    km: "ផ្តល់នូវអារម្មណ៍ប្រសើរ និងកម្លាំងបញ្ឈប់ដ៏ខ្លាំងក្លានៅពេលអ្នកត្រូវការបំផុត។",
    zh: "在关键时刻提供出色的操控手感与强劲制动力。",
  },
  "listing.clickToZoom": {
    en: "Click to Zoom",
    km: "ចុចដើម្បីពង្រីក",
    zh: "点击放大",
  },
  "listing.close": { en: "Close", km: "បិទ", zh: "关闭" },
  "listing.zoomedImageAlt": {
    en: "Zoomed Vehicle",
    km: "រូបភាពរថយន្តពង្រីក",
    zh: "放大车辆图片",
  },
  "listing.noPhotosAvailable": {
    en: "No Photos Available",
    km: "មិនមានរូបភាព",
    zh: "暂无图片",
  },
  "listing.thumbnail": {
    en: "Thumbnail",
    km: "រូបភាពតូច",
    zh: "缩略图",
  },
};
