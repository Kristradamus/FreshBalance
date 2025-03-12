import { useTranslation } from 'react-i18next';
import "./favourites.css"

export default function Favourites() {
  const { t } = useTranslation();
  return (
    <div className="favourites">
      <div>
        {t("")}
      </div>
    </div>
  )
}
