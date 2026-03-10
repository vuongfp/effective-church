export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "vi", label: "Tiếng Việt" },
];

const translations = {
  // Visitor Signup
  visitor_welcome_title: { en: "Welcome!", fr: "Bienvenue!", vi: "Chào mừng!" },
  visitor_welcome_subtitle: { en: "Please sign in to check in for today's service.", fr: "Veuillez vous inscrire pour la réunion d'aujourd'hui.", vi: "Vui lòng đăng ký tham dự buổi nhóm hôm nay." },
  visitor_returning_greeting: { en: "Welcome back", fr: "Ravi de vous revoir", vi: "Chào mừng trở lại" },
  visitor_returning_subtitle: { en: "Your info has been pre-filled below.", fr: "Vos informations ont été préremplies.", vi: "Thông tin của bạn đã được điền sẵn." },
  visitor_not_me: { en: "Not me", fr: "Ce n'est pas moi", vi: "Không phải tôi" },
  visitor_first_name: { en: "First Name", fr: "Prénom", vi: "Tên" },
  visitor_last_name: { en: "Last Name", fr: "Nom de famille", vi: "Họ" },
  visitor_email: { en: "Email", fr: "Courriel", vi: "Email" },
  visitor_phone: { en: "Phone", fr: "Téléphone", vi: "Số điện thoại" },
  visitor_address: { en: "Address", fr: "Adresse", vi: "Địa chỉ" },
  visitor_address_placeholder: { en: "123 Main St, City", fr: "123 rue Principale, Ville", vi: "123 Đường ABC, Thành phố" },
  visitor_notes: { en: "Notes / Prayer Requests", fr: "Notes / Sujets de prière", vi: "Ghi chú / Xin cầu nguyện" },
  visitor_notes_placeholder: { en: "Anything you'd like us to know...", fr: "Quelque chose que vous voulez nous dire...", vi: "Điều gì bạn muốn chúng tôi biết..." },
  visitor_contact_interest: { en: "I'd like someone to contact me", fr: "Je souhaite être contacté(e)", vi: "Tôi muốn được liên lạc" },
  visitor_checkin_btn: { en: "Check In", fr: "S'enregistrer", vi: "Đăng Ký" },
  visitor_confirm_btn: { en: "Confirm Check In", fr: "Confirmer l'enregistrement", vi: "Xác Nhận Đăng Ký" },
  visitor_saving: { en: "Saving...", fr: "Enregistrement...", vi: "Đang lưu..." },
  visitor_success_title: { en: "You're checked in!", fr: "Vous êtes enregistré!", vi: "Bạn đã đăng ký thành công!" },
  visitor_success_subtitle: { en: "God bless you. Redirecting...", fr: "Que Dieu vous bénisse. Redirection...", vi: "Cầu Chúa ban phước cho bạn. Đang chuyển hướng..." },
  visitor_privacy_note: { en: "Your information is kept private and secure.", fr: "Vos informations sont gardées privées et sécurisées.", vi: "Thông tin của bạn được giữ bí mật và an toàn." },

  // Church Home
  church_home_welcome: { en: "Welcome to Our Church", fr: "Bienvenue dans notre église", vi: "Chào Mừng Đến Với Hội Thánh" },
  church_home_tagline: { en: "We're glad you're here. Come as you are and experience God's love.", fr: "Nous sommes heureux que vous soyez là. Venez comme vous êtes.", vi: "Chúng tôi vui mừng khi bạn đến. Hãy đến như bạn đang có và cảm nhận tình yêu Chúa." },
  church_service_times: { en: "Service Times", fr: "Horaires des cultes", vi: "Giờ Nhóm Họp" },
  church_main_service: { en: "Main Service", fr: "Culte principal", vi: "Buổi Nhóm Chính" },
  church_prayer_bible: { en: "Prayer & Bible Study", fr: "Prière & Étude biblique", vi: "Cầu Nguyện & Học Kinh Thánh" },
  church_youth: { en: "Youth Service", fr: "Culte des jeunes", vi: "Nhóm Thanh Niên" },
  church_sunday: { en: "Sunday", fr: "Dimanche", vi: "Chủ Nhật" },
  church_wednesday: { en: "Wednesday", fr: "Mercredi", vi: "Thứ Tư" },
  church_friday: { en: "Friday", fr: "Vendredi", vi: "Thứ Sáu" },
  church_upcoming_events: { en: "Upcoming Events", fr: "Événements à venir", vi: "Sự Kiện Sắp Tới" },
  church_announcements: { en: "Announcements", fr: "Annonces", vi: "Thông Báo" },
  church_contact_us: { en: "Contact Us", fr: "Nous contacter", vi: "Liên Hệ" },
  church_thank_you: { en: "Thank you for joining us today!", fr: "Merci d'être parmi nous aujourd'hui!", vi: "Cảm ơn bạn đã tham dự hôm nay!" },
};

export function t(key, lang = "en") {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry["en"] || key;
}