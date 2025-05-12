import React, { useEffect, useState } from 'react';
import { Loader } from '../../loader/loader';
import { Footer } from '../../footer/footer';
import { Info } from './info/info';

const MyPage: React.FC = () => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const handleFooterAnimationComplete = () => {
    console.log('Footer animation completed!');
    setAnimationFinished(true);
    // You can perform other actions here based on the completion
  };

  return (
    <div className= " max-h-screen overflow-hidden">
      {<Loader />}
      <div>
        <div className='relavtive max-h-screen'>
      {/* Your page content */}
      <Info/>
      </div>
      <Footer onAnimationComplete={handleFooterAnimationComplete} />
      </div>
      {/* ... other elements ... */}
    </div>
  );
};

export default MyPage;