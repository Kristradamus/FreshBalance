import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('bul')}>Bulgarian</button>
    </div>
  );
}