import React, { useEffect, useState } from 'react';
import { Loader } from '../../loader/loader';
import { Footer } from '../../footer/footer';
import { Info } from './info/info';

const MyPage: React.FC = () => {


  return (
    <div className= " max-h-screen overflow-hidden">
      {<Loader />}
      <div>
        <div>
      {/* Your page content */}
      <Info/>
      </div>
      <Footer/>
      </div>
      {/* ... other elements ... */}
    </div>
  );
};

export default MyPage;