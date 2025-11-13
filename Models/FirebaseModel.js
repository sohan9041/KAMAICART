import Firebase from "../Schema/firebase.js"; // adjust import to your structure

// ✅ Save Firebase Token
export const saveFirebaseToken = async (data) => {
  const existing = await Firebase.findOne({
    where: { user_id: data.user_id, token: data.token, device_id: data.device_id },
  });

  if (!existing) {
    return await Firebase.create(data);
  }
  return existing;
};

// ✅ Delete Single Token
export const deleteFirebaseToken = async (user_id,device_id) => {
  return await Firebase.destroy({ where: { user_id , device_id} });
};
