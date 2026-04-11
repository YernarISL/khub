import { createRoot } from 'react-dom/client'
import './index.css'
import "./app/i18n";
import App from '../src/app/App'

createRoot(document.getElementById('root')).render(
  <App />
)
