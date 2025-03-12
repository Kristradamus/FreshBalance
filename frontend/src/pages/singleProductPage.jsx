import { useTranslation } from 'react-i18next';
import "./singleProductPage.css";

export default function SingleProductPage() {
const { t } = useTranslation();

return (
  <div className="singleProductPage">
    <div>{t("")}</div>
  </div>
)};