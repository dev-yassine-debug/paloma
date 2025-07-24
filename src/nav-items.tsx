
import React from "react";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminWallets from "./pages/admin/AdminWallets";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFeaturedProducts from "./pages/admin/AdminFeaturedProducts";

export const navItems = [
  {
    title: "Admin Login",
    to: "/admin-login",
    page: <AdminLogin />,
  },
  {
    title: "لوحة المعلومات",
    to: "/admin/dashboard",
    page: <AdminDashboard />,
  },
  {
    title: "إدارة المستخدمين",
    to: "/admin/users",
    page: <AdminUsers />,
  },
  {
    title: "إدارة المنتجات",
    to: "/admin/products",
    page: <AdminProducts />,
  },
  {
    title: "إدارة الطلبات",
    to: "/admin/orders",
    page: <AdminOrders />,
  },
  {
    title: "إدارة المحافظ",
    to: "/admin/wallets",
    page: <AdminWallets />,
  },
  {
    title: "المعاملات المالية",
    to: "/admin/transactions",
    page: <AdminTransactions />,
  },
  {
    title: "التحليلات والتقارير",
    to: "/admin/analytics",
    page: <AdminOverview />,
  },
  {
    title: "الأمان والمراجعة",
    to: "/admin/security",
    page: <AdminSecurity />,
  },
  {
    title: "إعدادات النظام",
    to: "/admin/settings",
    page: <AdminSettings />,
  },
  {
    title: "إدارة المنتجات المميزة",
    to: "/admin/featured-products",
    page: <AdminFeaturedProducts />,
  },
];
