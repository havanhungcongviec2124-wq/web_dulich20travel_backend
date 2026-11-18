require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/config");

const User = require("../models/user.model");
const Category = require("../models/category.model");
const Location = require("../models/location.model");
const Consultant = require("../models/consultant.model");
const Service = require("../models/service.model");
const PricingRule = require("../models/pricingRule.model");
const DailyPrice = require("../models/dailyPrice.model");
const SiteContent = require("../models/siteContent.model");
const ActivityLog = require("../models/activityLog.model");

const categories = [
  { key: "hotel", name: "Khách sạn", slug: "/khach-san", desc: "Khách sạn, villa, homestay đã kiểm duyệt", unit: "lựa chọn", icon: "hotel", image: "/images/hotel.jpg", status: "Bật", order: 1 },
  { key: "cruise-day", name: "Du thuyền ngày", slug: "/du-thuyen-ngay", desc: "Du thuyền tham quan vịnh trong ngày", unit: "hành trình", icon: "ship", image: "/images/ha-long.jpg", status: "Bật", order: 2 },
  { key: "cruise-night", name: "Du thuyền đêm", slug: "/du-thuyen-dem", desc: "Du thuyền ngủ đêm trên vịnh Hạ Long, Lan Hạ", unit: "hành trình", icon: "moon", image: "/images/cruise.jpg", status: "Bật", order: 3 },
  { key: "ticket", name: "Vé vui chơi", slug: "/ve-vui-choi", desc: "Cáp treo, công viên, khu du lịch, show diễn", unit: "trải nghiệm", icon: "ticket", image: "/images/ticket.jpg", status: "Bật", order: 4 },
  { key: "transport", name: "Xe & dịch vụ khác", slug: "/xe-dich-vu", desc: "Xe giường nằm, limousine, đưa đón sân bay", unit: "dịch vụ", icon: "bus", image: "/images/bus.jpg", status: "Bật", order: 5 },
  { key: "tour", name: "Tour trọn gói", slug: "/tour", desc: "Hành trình 1–5 ngày, xe – ăn – HDV – vé tham quan", unit: "hành trình", icon: "map", image: "/images/sapa.jpg", status: "Bật", order: 6 },
];

const locations = [
  { slug: "ha-long", name: "Hạ Long", region: "Miền Bắc", image: "/images/ha-long.jpg", type: "location", order: 1 },
  { slug: "ninh-binh", name: "Ninh Bình", region: "Miền Bắc", image: "/images/ninh-binh.jpg", type: "location", order: 2 },
  { slug: "ha-noi", name: "Hà Nội", region: "Miền Bắc", image: "/images/ha-noi.jpg", type: "location", order: 3 },
  { slug: "sapa", name: "Sapa – Lào Cai", region: "Miền Bắc", image: "/images/sapa.jpg", type: "location", order: 4 },
  { slug: "ha-giang", name: "Hà Giang", region: "Miền Bắc", image: "/images/ha-giang.jpg", type: "location", order: 5 },
  { slug: "cat-ba", name: "Cát Bà – Hải Phòng", region: "Miền Bắc", image: "/images/cat-ba.jpg", type: "location", order: 6 },
  { slug: "co-to", name: "Cô Tô – Quảng Ninh", region: "Miền Bắc", image: "/images/co-to.jpg", type: "location", order: 7 },
  { slug: "phong-nha", name: "Phong Nha – Quảng Bình", region: "Miền Trung", image: "/images/phong-nha.jpg", type: "location", order: 8 },
  { slug: "yen-tu", name: "Yên Tử", region: "Miền Bắc", image: "/images/yen-tu.jpg", type: "location", order: 9 },
  { slug: "chua-huong", name: "Chùa Hương", region: "Miền Bắc", image: "/images/chua-huong.jpg", type: "location", order: 10 },
  { slug: "moc-chau", name: "Mộc Châu – Sơn La", region: "Miền Bắc", image: "/images/moc-chau.jpg", type: "location", order: 11 },
  { slug: "mu-cang-chai", name: "Mù Cang Chải – Yên Bái", region: "Miền Bắc", image: "/images/mu-cang-chai.jpg", type: "location", order: 12 },
  { slug: "cao-bang", name: "Cao Bằng", region: "Miền Bắc", image: "/images/cao-bang.jpg", type: "location", order: 13 },
  { slug: "mai-chau", name: "Mai Châu", region: "Miền Bắc", image: "/images/mai-chau.jpg", type: "location", order: 14 },
  { slug: "tay-bac", name: "Tây Bắc", region: "Miền Bắc", image: "/images/sapa.jpg", type: "location", order: 15 },
  { slug: "quan-lan", name: "Quan Lạn", region: "Miền Bắc", image: "/images/quan-lan.jpg", type: "location", order: 16 },
  { slug: "mong-cai", name: "Móng Cái", region: "Miền Bắc", image: "/images/mong-cai.jpg", type: "location", order: 17 },
  { slug: "binh-lieu", name: "Bình Liêu", region: "Miền Bắc", image: "/images/binh-lieu.jpg", type: "location", order: 18 },
  { slug: "tuyen-quang", name: "Na Hang", region: "Miền Bắc", image: "/images/tuyen-quang.jpg", type: "location", order: 19 },
  { slug: "ta-xua", name: "Tà Xùa", region: "Miền Bắc", image: "/images/ta-xua.jpg", type: "location", order: 20 },
];

const consultants = [
  { key: "minh-anh", name: "Minh Anh", role: "Khách sạn", specialty: "Chuyên viên nghỉ dưỡng Hạ Long", phone: "036 271 5585", zalo: "https://zalo.me/0362715585", facebook: "facebook.com/20travel.minhanh", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", tagline: "Hỗ trợ chọn phòng và lịch giá theo ngày.", image: "/images/figma-consultant.jpg", order: 1 },
  { key: "hoang-nam", name: "Hoàng Nam", role: "Du thuyền", specialty: "Chuyên viên tư vấn du thuyền vịnh", phone: "0936 878 000", zalo: "https://zalo.me/0936878000", facebook: "facebook.com/20travel.hoangnam", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 2 },
  { key: "thu-ha", name: "Thu Hà", role: "Vé vui chơi", specialty: "Tư vấn công viên giải trí & cáp treo", phone: "0962 150 296", zalo: "https://zalo.me/0962150296", facebook: "facebook.com/20travel.thuha", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 3 },
  { key: "hai-dang", name: "Hải Đăng", role: "Xe & dịch vụ", specialty: "Điều phối vận chuyển & xe đón tiễn", phone: "0971 622 607", zalo: "https://zalo.me/0971622607", facebook: "facebook.com/20travel.haidang", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 4 },
  { key: "ngoc-linh", name: "Ngọc Linh", role: "Khách sạn", specialty: "Nghỉ dưỡng & Homestay cao cấp", phone: "0974 957 947", zalo: "https://zalo.me/0974957947", facebook: "facebook.com/20travel.ngoclinh", status: "Tạm ẩn", active: false, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 5 },
  { key: "bao-ngoc", name: "Bảo Ngọc", role: "Du thuyền", specialty: "Tư vấn du thuyền ngày & VIP charter", phone: "0943 977 622", zalo: "https://zalo.me/0943977622", facebook: "facebook.com/20travel.baongoc", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 6 },
  { key: "hoang-thien", name: "Hoàng Thiên", role: "Nghỉ dưỡng & Du thuyền", specialty: "Chuyên viên nghỉ dưỡng & du thuyền", phone: "036 271 5585", zalo: "https://zalo.me/0362715585", facebook: "https://facebook.com/hoangthiendll", status: "Hoạt động", active: true, avatar: "/images/figma-consultant.jpg", tagline: "Lắng nghe nhu cầu, gợi ý đúng hành trình.", image: "/images/figma-consultant.jpg", order: 7 },
  { key: "do-phong", name: "Đỗ Phong", role: "Marketing", specialty: "Chăm sóc khách hàng & truyền thông", phone: "0976 688 861", zalo: "https://zalo.me/0976688861", facebook: "facebook.com/20travel.dophong", status: "Tạm ẩn", active: false, avatar: "/images/figma-consultant.jpg", image: "/images/figma-consultant.jpg", order: 8 },
];

const services = [
  {
    code: "HL1",
    slug: "ha-long-6-tieng-tau-deluxe",
    name: "Hạ Long 6 tiếng – Sửng Sốt, Titop, Hang Luồn",
    subtitle: "Tàu Deluxe · Ăn set menu · Cao tốc 2 chiều",
    category: "cruise-day",
    categoryName: "Du thuyền ngày",
    locationSlug: "ha-long",
    locationName: "Hạ Long",
    duration: "1 ngày",
    departure: "Hàng ngày",
    price: 1000000,
    image: "/images/ha-long.jpg",
    gallery: ["/images/ha-long.jpg", "/images/cruise.jpg", "/images/ninh-binh.jpg"],
    badge: "Bán chạy",
    featured: true,
    rating: 4.9,
    reviews: 214,
    tags: ["Xe đưa đón", "Ăn trưa", "HDV Việt/Anh", "Kayak"],
    summary: "Hành trình 6 tiếng khám phá vịnh Hạ Long với tàu Deluxe, ăn set menu trên tàu và xe cao tốc 2 chiều đời mới.",
    highlights: [
      "Ngắm Sửng Sốt – hang động rộng nhất vịnh Hạ Long",
      "Tắm biển và leo 400 bậc lên đỉnh Titop",
      "Kayak hoặc đò tay len lỏi Hang Luồn",
      "Xe ô tô đời mới chạy cao tốc 2 chiều, HDV tiếng Việt/Anh",
    ],
    included: [
      "Xe ô tô đời mới đưa đón Hà Nội – Hạ Long (cao tốc 2 chiều)",
      "Ăn trưa set menu trên tàu",
      "Vé thắng cảnh vịnh Hạ Long, tàu tham quan",
      "Hướng dẫn viên tiếng Việt/Anh, nước uống trên xe",
    ],
    excluded: ["Kayak hoặc đò tay: +80.000đ/khách", "Đồ uống, VAT 8%, chi phí cá nhân"],
    options: [
      { name: "Đón trả tại Hà Nội", price: 800000 },
      { name: "Đón trả tại bến Hạ Long", price: 700000 },
      { name: "Kayak / đò tay Hang Luồn", price: 80000 },
    ],
    itinerary: [
      { time: "07:00", title: "Đón khách tại Hà Nội", desc: "Xe đời mới đón tại phố cổ, di chuyển cao tốc 2 chiều về Hạ Long." },
      { time: "10:00", title: "Lên tàu Deluxe", desc: "Check-in tàu, thưởng thức set menu trưa với đặc sản biển." },
      { time: "12:30", title: "Sửng Sốt – Titop", desc: "Tham quan hang Sửng Sốt, tắm biển và ngắm toàn cảnh vịnh từ đỉnh Titop." },
      { time: "15:00", title: "Hang Luồn – Kayak", desc: "Chèo kayak hoặc đò tay khám phá Hang Luồn." },
      { time: "17:30", title: "Về Hà Nội", desc: "Tàu về bến, xe đưa đoàn về Hà Nội, kết thúc chương trình." },
    ],
    status: "Hiển thị",
    published: true,
    updatedAtLabel: "16/11/2026",
  },
  {
    code: "KS001",
    slug: "vinpearl-resort-spa-ha-long",
    name: "Vinpearl Resort & Spa Hạ Long",
    subtitle: "Đảo Rều · Bãi Cháy · Hạ Long",
    category: "hotel",
    categoryName: "Khách sạn",
    locationSlug: "ha-long",
    locationName: "Hạ Long",
    address: "Đảo Rều, Bãi Cháy, Hạ Long, Quảng Ninh",
    duration: "Theo đêm",
    departure: "Nhận phòng 14:00",
    price: 2450000,
    weekendPrice: 2850000,
    fixedPrices: true,
    priceUnit: "phòng / đêm",
    roomType: "Phòng Deluxe",
    guestStandard: "02 người lớn",
    stars: 5,
    image: "/images/figma-vinpearl.jpg",
    secondaryImage: "/images/ha-long.jpg",
    gallery: ["/images/figma-vinpearl.jpg", "/images/figma-ambassador.jpg", "/images/figma-hero.jpg"],
    rating: 4.9,
    reviews: 328,
    featured: true,
    tag: "Nghỉ dưỡng cao cấp",
    featuredBadge: "Được khách hàng yêu thích",
    tags: ["Bể bơi ngoài trời", "Bãi biển riêng", "Ăn sáng buffet", "Wi-Fi miễn phí"],
    amenities: ["Bể bơi", "Bãi biển riêng", "Ăn sáng", "Wi-Fi"],
    amenitiesDetail: ["Bể bơi ngoài trời", "Bãi biển riêng", "Ăn sáng buffet", "Wi-Fi miễn phí"],
    summary: "Nghỉ dưỡng trên đảo Rều với tầm nhìn ôm trọn vịnh Hạ Long. Không gian thanh bình, bể bơi ngoài trời và bãi biển riêng.",
    summaryMobile: "Không gian nghỉ dưỡng giữa vịnh Hạ Long, bể bơi ngoài trời và bãi biển riêng.",
    overviewTitle: "Một khoảng riêng giữa lòng di sản",
    intro: "Một khoảng riêng giữa lòng di sản",
    description: "Nghỉ dưỡng trên đảo Rều với tầm nhìn ôm trọn vịnh Hạ Long. Không gian thanh bình, bể bơi ngoài trời và bãi biển riêng biệt lập.",
    highlights: [
      "Nghỉ dưỡng trên đảo Rều, tầm nhìn ôm trọn vịnh Hạ Long",
      "Bể bơi ngoài trời và bãi biển riêng",
      "Buffet sáng hơn 40 món, Wi-Fi miễn phí toàn khu",
    ],
    included: ["01 phòng Deluxe cho 02 người lớn", "Ăn sáng buffet", "Wi-Fi, bể bơi, bãi biển riêng"],
    excluded: ["Phụ thu cuối tuần, lễ Tết", "Dịch vụ spa, minibar", "VAT 8%"],
    notes: [
      "Nhận phòng từ 14:00, trả phòng trước 12:00.",
      "Phụ thu trẻ em theo độ tuổi và thời điểm.",
      "Chính sách hủy theo từng gói dịch vụ.",
      "Liên hệ để xác nhận phòng và giá cuối cùng.",
    ],
    options: [
      { name: "Phòng Deluxe", price: 2450000 },
      { name: "Suite hướng vịnh", price: 3450000 },
    ],
    status: "Hiển thị",
    published: true,
    consultant: "Minh Anh",
    updatedAtLabel: "16/11/2026",
  },
  {
    code: "DT002",
    slug: "du-thuyen-ambassador",
    name: "Du thuyền Ambassador",
    subtitle: "Vịnh Hạ Long · 2 ngày 1 đêm",
    category: "cruise-night",
    categoryName: "Du thuyền đêm",
    locationSlug: "ha-long",
    locationName: "Hạ Long",
    address: "Cảng tàu khách quốc tế Hạ Long, Bãi Cháy",
    duration: "2 ngày 1 đêm",
    departure: "Hàng ngày",
    price: 3200000,
    weekendPrice: 3600000,
    fixedPrices: true,
    priceUnit: "khách",
    roomType: "Cabin Deluxe Balcony",
    guestStandard: "02 khách / phòng",
    stars: 5,
    image: "/images/figma-ambassador.jpg",
    secondaryImage: "/images/cruise.jpg",
    gallery: ["/images/figma-ambassador.jpg", "/images/figma-hero.jpg", "/images/cruise.jpg"],
    rating: 4.9,
    reviews: 186,
    featured: true,
    tag: "Du thuyền 5 sao",
    featuredBadge: "Được khách hàng yêu thích",
    tags: ["2 ngày 1 đêm", "Ăn uống", "Kayak"],
    amenities: ["2 ngày 1 đêm", "Ăn uống", "Kayak", "Buffet"],
    amenitiesDetail: ["Phòng nghỉ ban công riêng", "Buffet hải sản cao cấp", "Chèo thuyền Kayak", "Trà chiều & Tiệc hoàng hôn"],
    summary: "Hành trình 2 ngày 1 đêm trên du thuyền Ambassador giữa vịnh Hạ Long, trọn gói ăn uống và kayak.",
    intro: "Kiệt tác du thuyền vịnh Hạ Long",
    description: "Hải trình 2 ngày 1 đêm chuẩn 5 sao khám phá hang Sửng Sốt, đảo Ti Tốp, thưởng thức tiệc tối buffet tôm hùm thượng hạng giữa vịnh biển kỳ quan.",
    highlights: ["Du thuyền 5 sao giữa vịnh Hạ Long", "Trọn gói ăn uống trên tàu", "Kayak khám phá hang luồn"],
    included: ["01 đêm trên du thuyền", "Các bữa ăn theo chương trình", "Kayak, vé tham quan vịnh"],
    excluded: ["Đồ uống có cồn", "VAT 8%", "Chi phí cá nhân"],
    status: "Hiển thị",
    published: true,
    consultant: "Hoàng Nam",
    updatedAtLabel: "16/11/2026",
  },
  {
    code: "VV003",
    slug: "ve-sunworld-ha-long",
    name: "Sun World Hạ Long",
    subtitle: "Cáp treo · Công viên · Check-in",
    category: "ticket",
    categoryName: "Vé vui chơi",
    locationSlug: "ha-long",
    locationName: "Hạ Long",
    address: "Số 9 Đường Hạ Long, Bãi Cháy, TP. Hạ Long",
    duration: "Theo ngày",
    departure: "08:00 – 22:00",
    price: 350000,
    weekendPrice: 420000,
    fixedPrices: true,
    priceUnit: "khách",
    roomType: "Vé trọn gói",
    guestStandard: "01 vé người lớn",
    stars: 5,
    image: "/images/figma-sunworld.jpg",
    secondaryImage: "/images/ticket.jpg",
    gallery: ["/images/figma-sunworld.jpg", "/images/figma-hero.jpg", "/images/ticket.jpg"],
    rating: 4.9,
    reviews: 302,
    featured: true,
    tag: "Công viên giải trí",
    featuredBadge: "Được khách hàng yêu thích",
    tags: ["Cáp treo", "Công viên", "Check-in"],
    amenities: ["Cáp treo", "Công viên", "Check-in"],
    amenitiesDetail: ["Cáp treo Nữ Hoàng đạt kỷ lục Guinness", "Vòng quay Mặt Trời Sun Wheel", "Công viên Rồng Dragon Park", "Công viên nước Vịnh Lốc Xoáy"],
    summary: "Vé cáp treo Nữ Hoàng và khu vui chơi Sun World Hạ Long, ngắm toàn cảnh vịnh từ trên cao.",
    intro: "Tổ hợp vui chơi giải trí tầm cỡ quốc tế",
    description: "Trải nghiệm cáp treo vượt biển Nữ Hoàng, ngắm toàn cảnh vịnh Hạ Long từ trên cao, bung xoã với hơn 30 trò chơi cảm giác mạnh hiện đại nhất Đông Nam Á.",
    highlights: ["Cáp treo Nữ Hoàng 2 tầng", "Công viên Dragon Park", "Ngắm vịnh Hạ Long từ 200m"],
    included: ["Vé vào cổng theo lựa chọn"],
    excluded: ["Chi phí cá nhân", "Đồ ăn, đồ uống"],
    options: [
      { name: "Vé cáp treo khứ hồi", price: 350000 },
      { name: "Combo cáp treo + công viên", price: 550000 },
    ],
    status: "Hiển thị",
    published: true,
    consultant: "Thu Hà",
    updatedAtLabel: "15/11/2026",
  },
  {
    code: "XE004",
    slug: "xe-san-bay-noi-bai-ha-long",
    name: "Xe sân bay Nội Bài – Hạ Long",
    subtitle: "Hà Nội – Hạ Long · Limousine VIP",
    category: "transport",
    categoryName: "Xe & dịch vụ",
    locationSlug: "ha-noi",
    locationName: "Hà Nội – Hạ Long",
    address: "Đón trả tận nơi tại Hà Nội & Hạ Long",
    duration: "2–3 giờ",
    departure: "Theo lịch",
    price: 850000,
    priceUnit: "chuyến",
    roomType: "Ghế VIP",
    guestStandard: "01 hành khách",
    stars: 4,
    image: "/images/bus.jpg",
    secondaryImage: "/images/bus.jpg",
    gallery: ["/images/bus.jpg"],
    rating: 4.8,
    reviews: 88,
    featured: false,
    tag: "Limousine VIP",
    featuredBadge: "Đưa đón tận nơi",
    tags: ["Xe VIP 9 chỗ", "Wifi & Sạc", "Nước uống"],
    amenities: ["Xe VIP 9 chỗ", "Wifi & Sạc", "Nước uống"],
    amenitiesDetail: ["Ghế massage cao cấp", "Wifi 4G tốc độ cao", "Khăn lạnh & nước suối", "Không bắt khách dọc đường"],
    summary: "Xe Limousine đời mới chạy cao tốc Hà Nội - Hải Phòng - Hạ Long, đón trả tận nơi.",
    intro: "Hành trình cao tốc êm ái, đúng giờ",
    description: "Xe Limousine đời mới chạy cao tốc Hà Nội - Hải Phòng - Hạ Long chỉ 2 tiếng, cam kết khởi hành đúng giờ.",
    highlights: ["Ghế massage cao cấp", "Đón trả tận nơi", "Khởi hành đúng giờ"],
    included: ["01 chỗ/ghế theo lựa chọn", "Nước uống, wifi"],
    excluded: ["Phụ thu điểm đón xa"],
    status: "Bản nháp",
    published: false,
    consultant: "Hải Đăng",
    updatedAtLabel: "14/11/2026",
  },
  {
    code: "SP1",
    slug: "sapa-cat-cat-fansipan-2n1d",
    name: "Sapa – Cát Cát – Fansipan 2N1Đ",
    subtitle: "Xe giường nằm · Khách sạn 3 sao",
    category: "tour",
    categoryName: "Tour trọn gói",
    locationSlug: "sapa",
    locationName: "Sapa",
    duration: "2 ngày 1 đêm",
    departure: "Hàng ngày",
    price: 1900000,
    image: "/images/sapa.jpg",
    gallery: ["/images/sapa.jpg", "/images/hotel.jpg", "/images/mu-cang-chai.jpg"],
    featured: true,
    rating: 4.8,
    reviews: 187,
    tags: ["Xe giường nằm", "Cát Cát", "Khách sạn 3 sao", "HDV bản địa"],
    summary: "Hai ngày một đêm Sapa: bản Cát Cát, ruộng bậc thang và khí hậu se lạnh vùng cao.",
    highlights: ["Bản Cát Cát – làng người Mông", "Xe giường nằm khứ hồi Hà Nội – Sapa", "Khách sạn 3 sao trung tâm"],
    included: ["Xe giường nằm khứ hồi", "Khách sạn 3 sao (2–3 khách/phòng)", "Các bữa ăn theo chương trình", "HDV địa phương, vé thắng cảnh"],
    excluded: ["Nâng cabin đôi +250.000đ/khách", "Cáp treo Fansipan +850.000đ/khách", "Phòng đơn"],
    options: [
      { name: "Xe giường nằm", price: 1900000 },
      { name: "Nâng cabin đôi", price: 250000 },
      { name: "Cáp treo Fansipan khứ hồi", price: 850000 },
    ],
    itinerary: [
      { time: "Ngày 1 – 06:30", title: "Hà Nội → Sapa", desc: "Xe giường nằm khởi hành, di chuyển cao tốc Nội Bài – Lào Cai." },
      { time: "Ngày 1 – 13:00", title: "Bản Cát Cát", desc: "Trek bản Cát Cát, tìm hiểu văn hoá người Mông, thác Tiên Sa." },
      { time: "Ngày 2 – 08:00", title: "Hàm Rồng / Fansipan", desc: "Tự do chọn chinh phục Fansipan bằng cáp treo hoặc núi Hàm Rồng." },
      { time: "Ngày 2 – 16:00", title: "Về Hà Nội", desc: "Xe giường nằm đưa đoàn về Hà Nội." },
    ],
    status: "Hiển thị",
    published: true,
    updatedAtLabel: "16/11/2026",
  },
  {
    code: "NB1",
    slug: "bai-dinh-trang-an-1-ngay",
    name: "Bái Đính – Tràng An 1 ngày",
    subtitle: "Xe đời mới · Ăn trưa nhà hàng · HDV",
    category: "tour",
    categoryName: "Tour trọn gói",
    locationSlug: "ninh-binh",
    locationName: "Ninh Bình",
    duration: "1 ngày",
    departure: "Hàng ngày",
    price: 890000,
    image: "/images/ninh-binh.jpg",
    gallery: ["/images/ninh-binh.jpg", "/images/bai-dinh.jpg"],
    rating: 4.8,
    reviews: 176,
    tags: ["Xe đời mới", "Ăn trưa", "HDV Việt/Anh", "Vé thắng cảnh"],
    summary: "Khám phá quần thể chùa Bái Đính và danh thắng Tràng An trong hành trình một ngày từ Hà Nội.",
    highlights: ["Chùa Bái Đính – ngôi chùa lớn nhất Việt Nam", "Thuyền nan xuyên hang Tràng An", "Ăn trưa tại nhà hàng địa phương"],
    included: ["Xe ô tô đời mới", "Ăn trưa tại nhà hàng", "HDV tiếng Việt/Anh", "Vé thắng cảnh"],
    excluded: ["Xe điện Bái Đính 150.000đ/khách", "Đồ uống, VAT"],
    itinerary: [
      { time: "07:30", title: "Khởi hành", desc: "Đón khách tại Hà Nội, đi Ninh Bình." },
      { time: "10:00", title: "Chùa Bái Đính", desc: "Tham quan điện Tam Thế, tháp chuông, tượng Phật." },
      { time: "12:00", title: "Ăn trưa", desc: "Đặc sản cơm cháy, thịt dê tại nhà hàng." },
      { time: "14:00", title: "Tràng An", desc: "Thuyền nan xuyên 9 hang, phim trường Kong." },
      { time: "18:30", title: "Về Hà Nội", desc: "Kết thúc chương trình." },
    ],
    status: "Hiển thị",
    published: true,
    updatedAtLabel: "15/11/2026",
  },
  {
    code: "XE-KE",
    slug: "sapa-king-express",
    name: "Sapa King Express – Giường nằm",
    subtitle: "Hà Nội ⇄ Sapa · Nhiều khung giờ",
    category: "transport",
    categoryName: "Xe & dịch vụ",
    locationSlug: "sapa",
    locationName: "Sapa",
    duration: "5–6 giờ",
    departure: "07:00 · 22:00",
    price: 240000,
    priceUnit: "chỗ",
    image: "/images/bus.jpg",
    gallery: ["/images/bus.jpg", "/images/sapa.jpg"],
    rating: 4.7,
    reviews: 512,
    tags: ["Giường nằm", "Wifi", "Nước uống"],
    summary: "Xe giường nằm King Express Hà Nội – Sapa, đón trả nhiều điểm, khởi hành hàng ngày.",
    highlights: ["Giường nằm êm ái", "Đón tại 204 Trần Quang Khải, sân bay Nội Bài", "Wifi, nước uống trên xe"],
    included: ["Vé giường nằm 1 chiều", "Nước uống, wifi"],
    excluded: ["Phí bến bãi sân bay 40.000đ/nhóm"],
    options: [
      { name: "Giường nằm", price: 240000 },
      { name: "Cabin đơn", price: 390000 },
      { name: "Cabin đôi", price: 580000 },
    ],
    status: "Hiển thị",
    published: true,
    updatedAtLabel: "14/11/2026",
  },
];

const pricingRules = [
  {
    serviceCode: "KS001",
    serviceName: "Vinpearl Resort & Spa Hạ Long",
    packageId: "deluxe-2",
    packageName: "Deluxe - 02 người lớn",
    weekday: { label: "Ngày thường", price: 2450000, sub: "Thứ Hai – Thứ Sáu" },
    weekend: { label: "Cuối tuần", price: 2850000, sub: "Thứ Bảy – Chủ Nhật" },
    lowSeason: { label: "Thấp điểm", price: 2150000, sub: "01–15/12/2026" },
    holiday: { label: "Lễ / Tết", price: 3950000, sub: "06–10/02/2027" },
    priorityNote: "Ưu tiên giá: Điều chỉnh theo ngày → Lễ/Tết → Thấp điểm → Cuối tuần → Ngày thường",
  },
  {
    serviceCode: "DT002",
    serviceName: "Du thuyền Ambassador",
    packageId: "default",
    packageName: "Cabin Deluxe",
    weekday: { label: "Ngày thường", price: 3200000, sub: "Thứ Hai – Thứ Sáu" },
    weekend: { label: "Cuối tuần", price: 3600000, sub: "Thứ Bảy – Chủ Nhật" },
    lowSeason: { label: "Thấp điểm", price: 2900000, sub: "Tháng thấp điểm" },
    holiday: { label: "Lễ / Tết", price: 4200000, sub: "Ngày lễ, Tết" },
    priorityNote: "Ưu tiên giá: Điều chỉnh theo ngày → Lễ/Tết → Thấp điểm → Cuối tuần → Ngày thường",
  },
];

const buildNovemberDaily = () => {
  const days = [];
  for (let d = 1; d <= 30; d++) {
    const date = `2026-11-${String(d).padStart(2, "0")}`;
    const dt = new Date(`2026-11-${String(d).padStart(2, "0")}T00:00:00Z`);
    const dow = dt.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    days.push({
      serviceCode: "KS001",
      packageId: "deluxe-2",
      date,
      type: weekend ? "Cuối tuần" : "Ngày thường",
      basePrice: 2450000,
      finalPrice: weekend ? 2850000 : 2450000,
      adjust: 0,
      note: "",
    });
  }
  return days;
};

const activityLogs = [
  {
    time: "16/11 • 09:42",
    admin: "Minh Anh",
    action: "Cập nhật giá",
    target: "KS001",
    targetName: "KS001 • Vinpearl Resort & Spa",
    dateApplied: "20/11/2026",
    packageInfo: "Phòng Deluxe • VNĐ / phòng / đêm",
    priceBefore: "2.350.000đ",
    priceAfter: "2.450.000đ",
    reason: "Cập nhật theo báo giá mới.",
    timestamp: "2026-11-16T09:42:00+07:00",
  },
  {
    time: "16/11 • 09:15",
    admin: "Hoàng Nam",
    action: "Cập nhật giá",
    target: "DT002",
    targetName: "DT002 • Du thuyền Ambassador",
    dateApplied: "21/11/2026",
    packageInfo: "Cabin Deluxe • VNĐ / khách",
    priceBefore: "3.200.000đ",
    priceAfter: "3.650.000đ",
    reason: "Phụ thu cuối tuần và tiệc tối.",
    timestamp: "2026-11-16T09:15:00+07:00",
  },
  {
    time: "16/11 • 08:57",
    admin: "Minh Anh",
    action: "Sửa dịch vụ",
    target: "KS001",
    targetName: "KS001 • Vinpearl Resort & Spa",
    dateApplied: "16/11/2026",
    packageInfo: "Thông tin tiện ích & hình ảnh",
    priceBefore: "—",
    priceAfter: "—",
    reason: "Cập nhật ảnh đại diện mới.",
    timestamp: "2026-11-16T08:57:00+07:00",
  },
  {
    time: "15/11 • 17:06",
    admin: "Hoàng Nam",
    action: "Import Excel",
    target: "125 dòng",
    targetName: "Bảng giá tháng 11/2026",
    dateApplied: "Tháng 11/2026",
    packageInfo: "Tất cả dịch vụ",
    priceBefore: "—",
    priceAfter: "125 bản ghi",
    reason: "Import định kỳ từ file Excel.",
    timestamp: "2026-11-15T17:06:00+07:00",
  },
  {
    time: "15/11 • 16:48",
    admin: "Minh Anh",
    action: "Ẩn nhân viên",
    target: "NV005",
    targetName: "NV005 • Ngọc Linh",
    dateApplied: "15/11/2026",
    packageInfo: "Nhân viên tư vấn",
    priceBefore: "Đang hoạt động",
    priceAfter: "Tạm ẩn",
    reason: "Nghỉ phép thường niên.",
    timestamp: "2026-11-15T16:48:00+07:00",
  },
];

const siteContent = {
  key: "main",
  company: {
    brand: "20 TRAVEL",
    slogan: "Khám phá theo cách của bạn",
    tagline: "Tra cứu dễ dàng. Nghỉ dưỡng xứng đáng.",
    desc: "Nền tảng tham khảo giá du lịch dành cho mọi hành trình. Không cần đăng nhập, tự do khám phá.",
    hotline: "036 271 5585",
    hotlineRaw: "0362715585",
    supportTime: "Tư vấn mỗi ngày: 8:00–22:00",
    workingHours: "08:00–22:00 mỗi ngày",
    facebook: "http://facebook.com/hoangthiendll",
    facebookLabel: "facebook.com/hoangthiendll",
    zalo: "https://zalo.me/0362715585",
    zaloLabel: "zalo.me/0362715585",
    email: "hotro@20travel.vn",
    address: "Đảo Rều, Bãi Cháy, Hạ Long, Quảng Ninh",
  },
  banners: [
    {
      title: "Chạm vào bình yên. Khám phá muôn nơi.",
      desc: "Tra cứu giá khách sạn, du thuyền và trải nghiệm du lịch. Thông tin rõ ràng, hành trình thảnh thơi.",
      buttonLabel: "Khám phá ngay",
      buttonLink: "/tra-cuu",
      image: "/images/figma-hero.jpg",
      status: "Đang hiển thị",
      order: 1,
    },
  ],
  policies: [],
  info: {
    taxNote: "Giá tour chưa bao gồm thuế VAT 08%, đồ uống và chi phí cá nhân.",
    paymentNote: "Thanh toán chuyển khoản hoặc tiền mặt 100% trước ngày khởi hành.",
  },
};

async function upsertMany(Model, items, keyFields) {
  for (const item of items) {
    const filter = {};
    keyFields.forEach((k) => {
      if (item[k] != null && item[k] !== "") filter[k] = item[k];
    });
    if (!Object.keys(filter).length) continue;
    await Model.findOneAndUpdate(filter, { $set: item }, { upsert: true, setDefaultsOnInsert: true });
  }
}

async function main() {
  await connectDB();
  console.log("Seeding...");

  // admin
  const adminEmail = "admin@20travel.vn";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({ name: "Quản trị viên", email: adminEmail, password: "20travel2026", role: "admin", avatar: "/images/figma-consultant.jpg", active: true });
    console.log("Created admin");
  } else {
    console.log("Admin exists");
  }

  await upsertMany(Category, categories, ["key"]);
  await upsertMany(Location, locations, ["slug"]);
  await upsertMany(Consultant, consultants, ["key"]);

  for (const svc of services) {
    await Service.findOneAndUpdate({ slug: svc.slug }, { $set: svc }, { upsert: true, setDefaultsOnInsert: true });
  }

  for (const rule of pricingRules) {
    await PricingRule.findOneAndUpdate(
      { serviceCode: rule.serviceCode, packageId: rule.packageId },
      { $set: rule },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  const daily = buildNovemberDaily();
  for (const d of daily) {
    await DailyPrice.findOneAndUpdate(
      { serviceCode: d.serviceCode, packageId: d.packageId, date: d.date },
      { $set: d },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  await SiteContent.findOneAndUpdate({ key: "main" }, { $set: siteContent }, { upsert: true, setDefaultsOnInsert: true });

  // seed logs only if empty
  const logCount = await ActivityLog.countDocuments();
  if (logCount === 0) {
    await ActivityLog.insertMany(activityLogs);
    console.log("Seeded activity logs");
  } else {
    console.log("Activity logs exist, skip");
  }

  // sync category counts
  const counts = await Service.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [c._id, c.count]));
  const cats = await Category.find();
  for (const c of cats) {
    let count = countMap.get(c.key) || 0;
    if (c.key === "cruise") count = (countMap.get("cruise-day") || 0) + (countMap.get("cruise-night") || 0);
    c.count = count;
    await c.save();
  }

  console.log("Seed completed.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
