import i18next from 'i18next';
import resources from './locales';

export default async () => {
  const i18nInstance = i18next.createInstance();
  await i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });
  return i18nInstance;
};
