// Admin hook stubs for localStorage-based app
// Admin is always the fixed demo admin
export function useMyAdmin() {
  return {
    data: {
      id: "admin-001",
      profile_id: "admin-001",
      institute_name: "Akshay Classes",
      institute_code: "AC001",
      address: "Pune, Maharashtra",
    },
    isLoading: false,
  };
}
