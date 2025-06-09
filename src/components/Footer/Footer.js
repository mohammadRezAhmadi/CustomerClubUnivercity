import React from 'react'
import './Footer.css'
function Footer() {
  return (
    <div className='footer mt-5 text-center'> 
      <div className='img-footer text-center '>
          <img src='./images/meli_mahrat.png' className='img-thumbnail'/>
      </div>
      <p className='text-footer text-center mt-5 fs-8 '>خراسان رضوی مشهد - میدان شهید کاوه - دانشگاه ملی مهارت</p>
      <div className='bottom-section-footer'>
          <span>برنامه نویس و طراح : محمدرضا احمدی</span>
      </div>
    </div>
  )
}

export default Footer
