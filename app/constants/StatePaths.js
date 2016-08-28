import { METRICS, CATEGORIES, FILTERS, STACKS } from './bucket';

export const APP_STATE = ['appState'];

export const ERRORS = [...APP_STATE, 'errors'];

export const APP_READY = [...APP_STATE, 'appReady'];
export const RESET_POSSIBLE = [...APP_STATE, 'reset'];
export const UNDO_POSSIBLE = [...APP_STATE, 'undo'];
export const REDO_POSSIBLE = [...APP_STATE, 'redo'];

export const BOOTSTRAP = [...APP_STATE, 'bootstrapData'];

export const USER_FIRST_NAME = [...BOOTSTRAP, 'accountSetting', 'firstName'];
export const USER_LAST_NAME = [...BOOTSTRAP, 'accountSetting', 'lastName'];
export const USER_URI = [...BOOTSTRAP, 'accountSetting', 'links', 'self'];
export const USER_LOGIN_MD5 = [...BOOTSTRAP, 'accountSetting', 'loginMD5'];
export const USER_EMAIL = [...BOOTSTRAP, 'accountSetting', 'email'];

export const FEATURE_FLAGS = [...BOOTSTRAP, 'featureFlags'];
export const BOOTSTRAP_DATA_PERMISSIONS = [...BOOTSTRAP, 'permissions'];

export const Permissions = {
    CAN_ACCESS_WORKBENCH: 'canAccessWorkbench',
    CAN_MANAGE_PROJECT_DASHBOARD: 'canManageProjectDashboard',
    CAN_UPLOAD_NON_PRODUCTION_CSV: 'canUploadNonProductionCSV'
};

export const PROJECT_TEMPLATE = [...BOOTSTRAP, 'project', 'template'];
export const PROJECT_TITLE = [...BOOTSTRAP, 'project', 'title'];
export const PROJECT_ID = [...BOOTSTRAP, 'project', 'id'];
export const PROJECT_URI = [...BOOTSTRAP, 'project', 'uri'];
export const PROJECT_TIMEZONE_OFFSET = [...BOOTSTRAP, 'project', 'timezoneOffset'];

export const BRANDING = [...BOOTSTRAP, 'branding'];
export const APPLE_TOUCH_ICON_URL = [...BRANDING, 'appleTouchIconUrl'];
export const FAVICON_URL = [...BRANDING, 'faviconUrl'];
export const ORGANIZATION_NAME = [...BRANDING, 'organizationName'];

export const MENU_ITEMS = [...APP_STATE, 'header', 'menuItems'];
export const ACCOUNT_MENU_ITEMS = [...APP_STATE, 'header', 'accountMenuItems'];

export const PAGE_TITLE = [...APP_STATE, 'pageTitle'];
export const ACTIVE_DRAG_ITEM = [...APP_STATE, 'drag', 'activeItem'];

export const META = [...APP_STATE, 'meta'];
export const DEVICE_VIEWPORT = [...META, 'device', 'viewport'];
export const DEVICE_PIXEL_RATIO = [...META, 'device', 'pixelRatio'];
export const IS_MOBILE_DEVICE = [...META, 'device', 'isMobile'];
export const IS_EMBEDDED = [...META, 'isEmbedded'];

export const DATA = ['data'];

export const ITEM_CACHE = [...DATA, 'itemCache'];

export const CATALOGUE = [...DATA, 'catalogue'];
export const CATALOGUE_ITEMS = [...CATALOGUE, 'items'];
export const CATALOGUE_TOTALS = [...CATALOGUE, 'totals'];
export const CATALOGUE_LOADING = [...CATALOGUE, 'isLoading'];
export const CATALOGUE_PAGE_LOADING = [...CATALOGUE, 'isPageLoading'];
export const CATALOGUE_QUERY = [...CATALOGUE, 'query'];
export const CATALOGUE_FILTERS = [...CATALOGUE, 'filters'];
export const CATALOGUE_PAGING = [...CATALOGUE, 'paging'];
export const CATALOGUE_ACTIVE_FILTER_INDEX = [...CATALOGUE, 'activeFilterIndex'];
export const CATALOGUE_ACTIVE_DATASET_ID = [...CATALOGUE, 'activeDatasetId'];

export const DATASETS = [...DATA, 'datasets'];

export const DATE_DATASETS = [...DATA, 'dateDataSets'];
export const DATE_DATASETS_AVAILABLE = [...DATE_DATASETS, 'available'];
export const DATE_DATASETS_SELECTED = [...DATE_DATASETS, 'dateDataSet'];
export const DATE_DATASETS_SELECTED_ID = [...DATE_DATASETS_SELECTED, 'identifier'];
export const DATE_DATASETS_GRANULARITY = [...DATE_DATASETS, 'granularity'];
export const DATE_DATASETS_LOADED = [...DATE_DATASETS, 'loaded'];
export const DATE_DATASETS_UNAVAILABLE = [...DATE_DATASETS, 'unavailable'];
export const DATE_DATASETS_FIRST_AVAILABLE = [...DATE_DATASETS_AVAILABLE, 0];
export const DATE_DATASETS_FIRST_AVAILABLE_ID = [...DATE_DATASETS_FIRST_AVAILABLE, 'identifier'];

export const SHORTCUT = [...DATA, 'shortcut'];
export const SHORTCUT_DROPPED_ITEM = [...SHORTCUT, 'shortcutDroppedItem'];
export const SHORTCUT_DATE_DATASETS = [...SHORTCUT, 'shortcutDateDataSets'];
export const SHORTCUT_DATE_DATASETS_AVAILABLE = [...SHORTCUT_DATE_DATASETS, 'available'];
export const SHORTCUT_DATE_DATASETS_UNAVAILABLE = [...SHORTCUT_DATE_DATASETS, 'unavailable'];
export const SHORTCUT_DATE_DATASETS_LOADED = [...SHORTCUT_DATE_DATASETS, 'loaded'];
export const SHORTCUT_DATE_DATASETS_FIRST_AVAILABLE = [...SHORTCUT_DATE_DATASETS_AVAILABLE, 0];
export const SHORTCUT_DATE_DATASETS_FIRST_AVAILABLE_ID = [...SHORTCUT_DATE_DATASETS_FIRST_AVAILABLE, 'identifier'];

export const BUCKETS = [...DATA, 'buckets'];
export const BUCKETS_METRICS = [...BUCKETS, METRICS];
export const BUCKETS_METRICS_ITEMS = [...BUCKETS_METRICS, 'items'];
export const BUCKETS_CATEGORIES = [...BUCKETS, CATEGORIES];
export const BUCKETS_CATEGORIES_ITEMS = [...BUCKETS_CATEGORIES, 'items'];
export const BUCKETS_STACKS = [...BUCKETS, STACKS];
export const BUCKETS_STACKS_ITEMS = [...BUCKETS_STACKS, 'items'];
export const BUCKETS_FILTERS = [...BUCKETS, FILTERS];
export const BUCKETS_FILTERS_ITEMS = [...BUCKETS_FILTERS, 'items'];

export const VISUALIZATION_TYPE = [...DATA, 'visualizationType'];

export const DND_DATA = [...DATA, 'dndData'];

export const AVAILABLE_ATTRIBUTES = [...DATA, 'availableAttributes'];
export const AVAILABLE_ATTRIBUTES_ITEMS = [...AVAILABLE_ATTRIBUTES, 'items'];
export const AVAILABLE_ATTRIBUTES_METRIC = [...AVAILABLE_ATTRIBUTES, 'metric'];

export const ATTRIBUTE_ELEMENTS = [...DATA, 'attributeElements'];
export const ATTRIBUTE_ELEMENTS_QUERY = [...ATTRIBUTE_ELEMENTS, 'query'];
export const ATTRIBUTE_ELEMENTS_ITEMS = [...ATTRIBUTE_ELEMENTS, 'items'];
export const ATTRIBUTE_ELEMENTS_TOTAL = [...ATTRIBUTE_ELEMENTS, 'total'];
export const ATTRIBUTE_ELEMENTS_FILTERED_TOTAL = [...ATTRIBUTE_ELEMENTS, 'filteredTotal'];
export const ATTRIBUTE_ELEMENTS_INITIAL_ITEMS = [...ATTRIBUTE_ELEMENTS, 'initialItems'];
export const ATTRIBUTE_ELEMENTS_LOADING = [...ATTRIBUTE_ELEMENTS, 'isLoading'];

export const REPORT = ['report'];
export const REPORT_EXECUTION = [...REPORT, 'execution'];
export const REPORT_EXECUTION_FIRST = [...REPORT_EXECUTION, 'first'];
export const REPORT_EXECUTION_ID = [...REPORT_EXECUTION, 'id'];
export const REPORT_EXECUTION_DATA = [...REPORT_EXECUTION, 'data'];
export const REPORT_EXECUTION_DATA_EMPTY = [...REPORT_EXECUTION_DATA, 'isEmpty'];
export const REPORT_EXECUTION_RUNNING = [...REPORT_EXECUTION, 'running'];
export const REPORT_EXECUTION_ERROR = [...REPORT_EXECUTION, 'error'];
export const REPORT_EXECUTION_ERROR_STATUS = [...REPORT_EXECUTION_ERROR, 'status'];

export const REPORT_SAVING = [...REPORT, 'saving'];
export const REPORT_SAVING_AS_NEW = [...REPORT, 'savingAsNew'];
export const REPORT_LAST_SAVED_OBJECT = [...REPORT, 'lastSavedObject'];
export const REPORT_LAST_SAVED_OBJECT_DATA = [...REPORT_LAST_SAVED_OBJECT, 'visualization'];
export const REPORT_OPENING = [...REPORT, 'opening'];
export const REPORT_NOW_OPEN = [...REPORT, 'nowOpen'];
export const REPORT_CONTENT = [...REPORT_LAST_SAVED_OBJECT_DATA, 'content'];
export const REPORT_CONTENT_CATEGORIES = [...REPORT_CONTENT, 'buckets', 'categories'];
export const REPORT_CONTENT_FILTERS = [...REPORT_CONTENT, 'buckets', 'filters'];
export const REPORT_SAVED_TITLE = [...REPORT_LAST_SAVED_OBJECT_DATA, 'meta', 'title'];
export const REPORT_SAVED_URI = [...REPORT_LAST_SAVED_OBJECT_DATA, 'meta', 'uri'];
export const REPORT_CURRENT_TITLE = [...DATA, 'title'];

export const MESSAGES = [...APP_STATE, 'messages'];
export const MESSAGES_DISPLAYED = [...MESSAGES, 'displayed'];
export const MESSAGES_DELAYED = [...MESSAGES, 'delayed'];

export const DIALOGS = [...APP_STATE, 'dialogs'];
export const DIALOGS_OPEN_REPORT_CONFIRMATION = [...DIALOGS, 'openReportConfirmation'];
export const DIALOGS_OPEN_REPORT_CONFIRMATION_ACTIVE = [...DIALOGS_OPEN_REPORT_CONFIRMATION, 'active'];
export const DIALOGS_OPEN_REPORT_CONFIRMATION_DATA = [...DIALOGS_OPEN_REPORT_CONFIRMATION, 'data'];
export const DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION = [...DIALOGS, 'savingUntitledReport'];
export const DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION_ACTIVE = [...DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION, 'active'];
export const DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION_DATA = [...DIALOGS_SAVING_UNTITLED_REPORT_CONFIRMATION, 'data'];
export const DIALOGS_DELETE_REPORT_CONFIRMATION = [...DIALOGS, 'deleteReportConfirmation'];
export const DIALOGS_DELETE_REPORT_CONFIRMATION_ACTIVE = [...DIALOGS_DELETE_REPORT_CONFIRMATION, 'active'];
export const DIALOGS_DELETE_REPORT_CONFIRMATION_DATA = [...DIALOGS_DELETE_REPORT_CONFIRMATION, 'data'];
export const DIALOGS_DELETE_REPORT_CONFIRMATION_DATA_TITLE = [...DIALOGS_DELETE_REPORT_CONFIRMATION_DATA, 'meta', 'title'];
