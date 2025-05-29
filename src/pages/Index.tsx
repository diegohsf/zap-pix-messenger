
import React from 'react';
import MessageForm from '@/components/MessageForm';
import Footer from '@/components/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      <div className="flex-grow">
        <MessageForm />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
