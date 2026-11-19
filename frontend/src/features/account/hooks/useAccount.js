
import { useEffect, useSyncExternalStore } from "react";

import accountService from "../services/accountService";

const useAccount = () => {
  const account = useSyncExternalStore(
    accountService.subscribe,
    accountService.getSnapshot,
    accountService.getSnapshot
  );

  useEffect(() => {
    accountService.initialize();
  }, []);

  return {
    currentUser: account.currentUser,

    isAuthenticated: Boolean(account.currentUser),

    isLoading: !account.isInitialized,

    login: accountService.login,
    register: accountService.register,
    logout: accountService.logout,
    updateProfile: accountService.updateProfile,
    requestPasswordReset: accountService.requestPasswordReset,
  };
};

export default useAccount;
