import { GeneralSetting } from "../Schema/generalSetting.js";

// Create / Update Setting (single row)
export const saveSetting = async (data) => {
  let setting = await GeneralSetting.findOne();
  if (setting) {
    await setting.update(data);
  } else {
    setting = await GeneralSetting.create(data);
  }
  return setting;
};

// Get Setting
export const getSetting = async () => {
  return await GeneralSetting.findOne();
};
