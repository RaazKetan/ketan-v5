import React, { useState } from 'react';
import { Info } from './info/info';
import { Loader } from '../../Loader';
import { Footer } from '../../Footer';
import { useIsMobile } from '../../../Hooks';

const MyPage: React.FC = () => {
  const isMoible = useIsMobile();
  const [animationFinished, setAnimationFinished] = useState(false);
  const handleFooterAnimationComplete = () => {
    console.log('Footer animation completed!');
    setAnimationFinished(true);
  };

  return (
    <div className= " max-h-screen overflow-hidden">
      {<Loader />}
      <div>
        <div className='max-h-screen'>
     {animationFinished &&<Info/> }
      </div>
      </div>
      <Footer  onAnimationComplete={handleFooterAnimationComplete} />
    </div>
  );
};

export default MyPage;