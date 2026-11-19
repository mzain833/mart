
import apiClient from "../../../lib/apiClient";

let snapshot = {
  currentUser: null,
  isInitialized: false,
};

const listeners = new Set();
let initializationPromise = null;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const updateSnapshot = (updates) => {
  snapshot = {
    ...snapshot,
    ...updates,
  };

  notify();
};

const getUser = (response) => response.data.data.user;

const accountService = {
  getSnapshot: () => snapshot,

  subscribe: (listener) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  },

  async initialize() {
    if (snapshot.isInitialized) {
      return snapshot.currentUser;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      try {
        const response = await apiClient.get("/auth/me");

        updateSnapshot({
          currentUser: getUser(response),
          isInitialized: true,
        });
      } catch {
        updateSnapshot({
          currentUser: null,
          isInitialized: true,
        });
      } finally {
        initializationPromise = null;
      }

      return snapshot.currentUser;
    })();

    return initializationPromise;
  },

  async register(values) {
    const response = await apiClient.post(
      "/auth/register",
      values
    );

    const user = getUser(response);

    updateSnapshot({
      currentUser: user,
      isInitialized: true,
    });

    return user;
  },

  async login(values) {
    const response = await apiClient.post(
      "/auth/login",
      values
    );

    const user = getUser(response);

    updateSnapshot({
      currentUser: user,
      isInitialized: true,
    });

    return user;
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      updateSnapshot({
        currentUser: null,
        isInitialized: true,
      });
    }
  },

  async updateProfile(values) {
    const response = await apiClient.patch(
      "/auth/profile",
      values
    );

    const user = getUser(response);

    updateSnapshot({
      currentUser: user,
    });

    return user;
  },

  async requestPasswordReset(email) {
    if (!email?.trim()) {
      throw new Error("Email address is required.");
    }

    throw new Error(
      "Password reset is not available yet."
    );
  },
};

export default accountService;
