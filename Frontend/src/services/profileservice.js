
import api from "./api";

export const saveStudentProfile = async (username, profile) => {
  // Profile photo will be handled separately
  const { profilePhoto, ...profileData } = profile;

  const response = await api.put(
    `/profile/${encodeURIComponent(username)}`,
    profileData
  );

  return response.data;
};
