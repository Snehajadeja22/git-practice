
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProductlistPage from './components/ProductlistPage.tsx'
import ProductdetailPage from './components/ProductdetailPage.tsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Swiper from 'swiper';

const queryClient = new QueryClient();

function App() {


  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route index element={<Navigate to="/productlistpage" />} />
      <Route path='productlistpage' element={<ProductlistPage />} />
      <Route path='productdetailpage/:id' element={<ProductdetailPage />} />
      
   
  </Routes>
  </BrowserRouter>
      </QueryClientProvider>
      )
}

export default App
