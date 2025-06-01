import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import CouponManagement from '@/components/CouponManagement';
import RecentMessages from '@/components/RecentMessages';
import PromotionBanner from '@/components/PromotionBanner';
import BulkBlogGenerator from '@/components/BulkBlogGenerator';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel de Administração
          </h1>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Primeira coluna */}
          <div className="space-y-6">
            <AdminDashboard />
            <CouponManagement />
          </div>
          
          {/* Segunda coluna */}
          <div className="space-y-6">
            <RecentMessages />
            <BulkBlogGenerator />
          </div>
          
          {/* Terceira coluna */}
          <div className="space-y-6">
            <PromotionBanner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
