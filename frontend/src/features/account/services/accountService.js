
const SESSION_KEY = "nexamart-account-session";
const USERS_KEY = "nexamart-account-users";

const readStorage = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readUsers = () => {
  const users = readStorage(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
};

let users = readUsers();
let currentUser = readStorage(SESSION_KEY);

const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persistUsers = () => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const persistSession = (user) => {
  currentUser = user;

  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage may be unavailable.
  }

  notify();
};

const createUser = ({ fullName, email, phone = "" }) => ({
  id: `customer-${Date.now()}`,
  fullName: fullName.trim(),
  email: email.trim().toLowerCase(),
  phone: phone.trim(),
  createdAt: new Date().toISOString(),
});

const accountService = {
  getCurrentUser: () => currentUser,

  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async register(values) {
    const email = values.email.trim().toLowerCase();

    if (users.some((user) => user.email === email)) {
      throw new Error("An account with this email already exists.");
    }

    const user = createUser(values);

    users = [...users, user];
    persistUsers();
    persistSession(user);

    return user;
  },

  async login({ email }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) => item.email === normalizedEmail
    );

    if (!user) {
      throw new Error("No account found with this email address.");
    }

    persistSession(user);
    return user;
  },

  async logout() {
    persistSession(null);
  },

  async updateProfile(updates) {
    if (!currentUser) {
      throw new Error("Please sign in to update your profile.");
    }

    const updatedUser = {
      ...currentUser,
      fullName: updates.fullName.trim(),
      phone: updates.phone.trim(),
    };

    users = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );

    persistUsers();
    persistSession(updatedUser);

    return updatedUser;
  },

  async requestPasswordReset(email) {
    if (!email?.trim()) {
      throw new Error("Email address is required.");
    }

    return {
      success: true,
      message: "Password reset requires backend integration.",
    };
  },
};

export default accountService;
