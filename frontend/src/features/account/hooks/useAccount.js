
import { useSyncExternalStore } from "react";
import accountService from "../services/accountService";

const useAccount = () => {
  const currentUser = useSyncExternalStore(
    accountService.subscribe,
    accountService.getCurrentUser,
    () => null
  );

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login: accountService.login,
    register: accountService.register,
    logout: accountService.logout,
    updateProfile: accountService.updateProfile,
    requestPasswordReset: accountService.requestPasswordReset,
  };
};

export default useAccount;
