import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContentProvider } from "./hooks/useContent";
import { Layout } from "./components/layout/Layout";
import { Home } from "./sections/home/Home";
import {
  Products,
  ProductDetail,
  About,
  TV,
  News,
  NewsDetail,
  Contact,
  Privacy,
  NotFound,
} from "./pages/Pages";
import "./styles/global.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="tv" element={<TV />} />
            <Route path="news" element={<News />} />
            <Route path="news/:slug" element={<NewsDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
);
