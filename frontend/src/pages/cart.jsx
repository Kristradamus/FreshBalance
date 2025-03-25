import { useTranslation } from "react-i18next";
import "./cart.css"

export default function Cart() {
  const { t } = useTranslation();
  
  return (
    <div className="cart">
      <div>
        {t("")}
      </div>
    </div>
  )
}
