import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.jsx'

const antTheme = {
  token: {
    colorPrimary: '#0ea5e9',
    colorPrimaryHover: '#0284c7',
    borderRadius: 8,
    fontFamily: 'Inter, sans-serif',
    colorBgContainer: '#ffffff',
    colorBorder: '#e2e8f0',
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
  },
  components: {
    Menu: {
      itemBorderRadius: 12,
      itemSelectedBg: '#f0f9ff',
      itemSelectedColor: '#0ea5e9',
      itemHoverBg: '#f8fafc',
      itemHoverColor: '#334155',
    },
    Input: {
      borderRadius: 10,
      colorBgContainer: '#f8fafc',
    },
    Button: {
      borderRadius: 8,
    },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antTheme}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
