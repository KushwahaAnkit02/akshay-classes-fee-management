// Profile hooks for localStorage-based app
export function useMyProfile() {
  return { data: null, isLoading: false };
}
export function useUpdateProfile() {
  return { mutateAsync: async () => null, isPending: false };
}
