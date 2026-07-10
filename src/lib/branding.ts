export const APP_NAME = "الصعيدي درينك";
export const APP_TAGLINE = "نقطة البيع";
export const SHOP_SLOGAN = "آصل المشروبات الفريش";
export const SHOP_ADDRESS = "شارع الترعة - الشارع الجديد - مسطرد";
export const DEV_COMPANY = "CTS Creative Technology Solutions";
export const DEV_COMPANY_SHORT = "CTS";
export const DEV_TAGLINE = "Software House";
export const DEV_NAME = "Solieman Snossy";
export const DEV_PHONE = "01125833982";

export const LOGO_FILE = "cts_logo_concept_hexagon_circuit.png";

export const getLogoUrl = () =>
  new URL(`${import.meta.env.BASE_URL}${LOGO_FILE}`, window.location.origin).href;

/** @deprecated use APP_NAME */
export const SHOP_NAME = APP_NAME;
