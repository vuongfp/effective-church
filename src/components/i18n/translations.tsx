export const LANGUAGES = [
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
  { code: "en", label: "🇺🇸 English" },
];

type LangCode = "vi" | "en";
type TranslationMap = Record<string, Record<LangCode, string>>;

const translations: TranslationMap = {
  /* ── Sidebar Navigation ─────────────────────────── */
  nav_dashboard: { vi: "Trang Chính", en: "Dashboard" },
  nav_members: { vi: "Thành Viên", en: "Members" },
  nav_visitors: { vi: "Khách Thăm", en: "Visitors" },
  nav_events: { vi: "Sự Kiện", en: "Events" },
  nav_posts: { vi: "Tin Tức (CMS)", en: "News (CMS)" },
  nav_public_site: { vi: "Trang Công Khai ↗", en: "Public Site ↗" },

  /* ── Members Page ───────────────────────────────── */
  members_title: { vi: "Quản Lý Thành Viên", en: "Members" },
  members_tab_list: { vi: "Danh Sách", en: "List" },
  members_tab_map: { vi: "Bản Đồ", en: "Map" },
  members_tab_groups: { vi: "Nhóm", en: "Groups" },
  members_add: { vi: "Thêm Thành Viên", en: "Add Member" },
  members_search: { vi: "Tìm thành viên…", en: "Search members…" },
  members_col_name: { vi: "Họ & Tên", en: "Name" },
  members_col_email: { vi: "Email", en: "Email" },
  members_col_phone: { vi: "Điện Thoại", en: "Phone" },
  members_col_age: { vi: "Tuổi", en: "Age" },
  members_col_status: { vi: "Trạng Thái", en: "Status" },
  members_col_actions: { vi: "Thao Tác", en: "Actions" },

  /* ── Visitors Page ──────────────────────────────── */
  visitors_title: { vi: "Khách Thăm", en: "Visitor Tracking" },
  visitors_add: { vi: "Thêm Khách", en: "Add Visitor" },
  visitors_total: { vi: "Tổng Khách", en: "Total Visitors" },
  visitors_first_time: { vi: "Lần Đầu", en: "First Time" },
  visitors_returning: { vi: "Trở Lại", en: "Returning" },
  visitors_converted: { vi: "Thành Thành Viên", en: "Became Members" },

  /* ── Events Page ────────────────────────────────── */
  events_title: { vi: "Sự Kiện & Sinh Hoạt", en: "Events & Activities" },
  events_new: { vi: "Thêm Sự Kiện", en: "New Event" },
  events_total: { vi: "Tổng Cộng", en: "Total" },
  events_upcoming: { vi: "Sắp Tới", en: "Upcoming" },
  events_this_month: { vi: "Tháng Này", en: "This Month" },
  events_completed: { vi: "Hoàn Thành", en: "Completed" },
  events_search: { vi: "Tìm sự kiện…", en: "Search events…" },
  events_list_view: { vi: "Danh Sách", en: "List" },
  events_calendar_view: { vi: "Lịch", en: "Calendar" },
  events_modal_title_new: { vi: "Sự Kiện Mới", en: "New Event" },
  events_modal_title_edit: { vi: "Sửa Sự Kiện", en: "Edit Event" },
  events_mark_complete: { vi: "Đánh dấu hoàn thành", en: "Mark as completed" },
  events_save: { vi: "Lưu Sự Kiện", en: "Save Event" },
  events_advanced: { vi: "⚙️ Tuỳ Chỉnh Nâng Cao", en: "⚙️ Advanced Options" },
  events_cover_image: { vi: "Ảnh Bìa", en: "Cover Image" },
  events_bg_color: { vi: "Màu Nền", en: "Background Color" },
  events_agenda: { vi: "Chương Trình", en: "Agenda" },

  /* ── Posts CMS ──────────────────────────────────── */
  posts_title: { vi: "Quản Lý Bài Viết (CMS)", en: "Posts CMS" },
  posts_new: { vi: "Bài Viết Mới", en: "New Post" },
  posts_total: { vi: "Tổng Cộng", en: "Total" },
  posts_published: { vi: "Công Khai", en: "Published" },
  posts_drafts: { vi: "Bản Nháp", en: "Drafts" },
  posts_featured: { vi: "Nổi Bật", en: "Featured" },
  posts_save: { vi: "Lưu Bài Viết", en: "Save Post" },
  posts_view_site: { vi: "Xem trang Tin Tức", en: "View News Page" },

  /* ── Common UI ──────────────────────────────────── */
  common_save: { vi: "Lưu", en: "Save" },
  common_cancel: { vi: "Huỷ", en: "Cancel" },
  common_delete: { vi: "Xoá", en: "Delete" },
  common_edit: { vi: "Sửa", en: "Edit" },
  common_search: { vi: "Tìm kiếm", en: "Search" },
  common_add: { vi: "Thêm", en: "Add" },
  common_loading: { vi: "Đang tải…", en: "Loading…" },
  common_saving: { vi: "Đang lưu…", en: "Saving…" },
  common_all: { vi: "Tất Cả", en: "All" },
  common_login: { vi: "Đăng Nhập", en: "Login" },
  common_logout: { vi: "Đăng Xuất", en: "Logout" },
  common_yes: { vi: "Có", en: "Yes" },
  common_no: { vi: "Không", en: "No" },
  common_name: { vi: "Họ Tên", en: "Name" },
  common_email: { vi: "Email", en: "Email" },
  common_phone: { vi: "Điện Thoại", en: "Phone" },
  common_address: { vi: "Địa Chỉ", en: "Address" },
  common_notes: { vi: "Ghi Chú", en: "Notes" },
  common_status: { vi: "Trạng Thái", en: "Status" },
  common_date: { vi: "Ngày", en: "Date" },
  common_type: { vi: "Loại", en: "Type" },
  common_category: { vi: "Danh Mục", en: "Category" },
  common_location: { vi: "Địa Điểm", en: "Location" },
  common_confirm_delete: { vi: "Xác nhận xoá?", en: "Confirm delete?" },

  /* ── Visitor signup ─────────────────────────────── */
  visitor_welcome_title: { vi: "Chào mừng!", en: "Welcome!" },
  visitor_welcome_subtitle: { vi: "Vui lòng đăng ký tham dự buổi nhóm hôm nay.", en: "Please sign in to check in for today's service." },
  visitor_returning_greeting: { vi: "Chào mừng trở lại", en: "Welcome back" },
  visitor_returning_subtitle: { vi: "Thông tin của bạn đã được điền sẵn.", en: "Your info has been pre-filled below." },
  visitor_not_me: { vi: "Không phải tôi", en: "Not me" },
  visitor_first_name: { vi: "Tên", en: "First Name" },
  visitor_last_name: { vi: "Họ", en: "Last Name" },
  visitor_email: { vi: "Email", en: "Email" },
  visitor_phone: { vi: "Số điện thoại", en: "Phone" },
  visitor_address: { vi: "Địa chỉ", en: "Address" },
  visitor_address_placeholder: { vi: "123 Đường ABC, Thành phố", en: "123 Main St, City" },
  visitor_notes: { vi: "Ghi chú / Xin cầu nguyện", en: "Notes / Prayer Requests" },
  visitor_notes_placeholder: { vi: "Điều gì bạn muốn chúng tôi biết...", en: "Anything you'd like us to know..." },
  visitor_contact_interest: { vi: "Tôi muốn được liên lạc", en: "I'd like someone to contact me" },
  visitor_checkin_btn: { vi: "Đăng Ký", en: "Check In" },
  visitor_confirm_btn: { vi: "Xác Nhận Đăng Ký", en: "Confirm Check In" },
  visitor_saving: { vi: "Đang lưu...", en: "Saving..." },
  visitor_success_title: { vi: "Bạn đã đăng ký thành công!", en: "You're checked in!" },
  visitor_success_subtitle: { vi: "Cầu Chúa ban phước cho bạn. Đang chuyển hướng...", en: "God bless you. Redirecting..." },
  visitor_privacy_note: { vi: "Thông tin của bạn được giữ bí mật và an toàn.", en: "Your information is kept private and secure." },
};

export function t(key: string, lang: LangCode = "vi"): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry["vi"] ?? key;
}