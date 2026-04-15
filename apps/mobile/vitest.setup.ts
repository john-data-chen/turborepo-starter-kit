import { vi, afterEach } from "vitest";

// Define __DEV__ — use type assertion to avoid conflict with global var declaration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__DEV__ = true;

// Mock expo-modules-core
vi.mock("expo-modules-core", () => ({
  EventEmitter: class {
    addListener = vi.fn(() => ({ remove: vi.fn() }));
    removeAllListeners = vi.fn();
    emit = vi.fn();
  },
  NativeModulesProxy: {},
  ProxyNativeModule: {},
  requireNativeViewManager: vi.fn()
}));

// Mock react-native subpaths that contain Flow
vi.mock("react-native/Libraries/Image/resolveAssetSource", () => ({
  default: vi.fn()
}));

// Mock expo
vi.mock("expo", () => ({
  registerRootComponent: vi.fn(),
  requireOptionalNativeModule: vi.fn(),
  requireNativeModule: vi.fn()
}));

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock expo-secure-store
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn()
}));

// Mock expo-constants
vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: "http://localhost:3001"
      }
    }
  }
}));

// Mock expo-router
vi.mock("expo-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useLocalSearchParams: () => ({}),
  Link: "Link",
  Stack: {
    Screen: "Stack.Screen"
  },
  router: {
    replace: vi.fn(),
    push: vi.fn(),
    back: vi.fn()
  }
}));

// Mock react-native-safe-area-context
vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children
}));

// Mock i18next and react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn()
    }
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn()
  }
}));
