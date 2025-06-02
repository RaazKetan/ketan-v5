import React, { useState } from 'react';
import { Loader } from '../../Loader';
import { Info } from './Info/info';
import { Footer } from '../../Footer';

const MyPage: React.FC = () => {
  const [animationFinished, setAnimationFinished] = useState(false);
  const handleFooterAnimationComplete = () => {
    console.log('Footer animation completed!');
    setAnimationFinished(true);
  };

  return (
    <div className= " max-h-screen overflow-hidden">
      {/* {<Loader />} */}
      <div>
        <div className='max-h-screen'>
      {/* Your page content */}
     {animationFinished &&<Info/> }
      </div>
      <Footer  onAnimationComplete={handleFooterAnimationComplete} />
      </div>
      {/* ... other elements ... */}
    </div>
  );
};

export default MyPage;