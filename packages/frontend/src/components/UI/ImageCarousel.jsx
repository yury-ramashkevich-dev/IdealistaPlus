import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function ImageCarousel({ images = [] }) {
  if (images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
        <span className="text-gray-400 text-sm">No images available</span>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={0}
      slidesPerView={1}
      className="w-full h-48 rounded-t-lg"
    >
      {images.map((src, index) => (
        <SwiperSlide key={index}>
          <img
            src={src}
            alt={`Property image ${index + 1}`}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default ImageCarousel;
