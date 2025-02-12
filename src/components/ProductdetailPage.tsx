import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { Link, useParams } from "react-router-dom"
import { Zoom,Navigation,Pagination } from "swiper/modules"
import { Swiper,SwiperSlide } from "swiper/react"
import 'swiper/css';
import 'swiper/css/zoom';
import { useEffect, useState } from "react"

type Product = {
  id: number
  title: string
  description: string
  category: string
  price: number
  images: Array<string>
  discountPercentage: number
  rating: number
  brand: string
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  returnPolicy: string
  minimumOrderQuantity: number
  thumbnail: string
  reviews: Array<{
    rating: number
    comment: string
    reviewerName: string
    reviewerEmail: string
  }>

}




const fetchProduct = async (id: number) => {
  const { data } = await axios.get<Product>(`https://dummyjson.com/products/${id}`);
  return data;
};

const ProductdetailPage = () => {
  const { id } = useParams();

  //Use `useQuery` for fetching and caching
  const { data: product, error, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(Number(id)),
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });


  const [selectedImage, setSelectedImage] = useState<string>(" ")

  useEffect(() => {
    if (!product?.images || product.images.length === 0) return;
    const interval = setInterval(() => {
      setSelectedImage((prevState) => {
        const current = product.images.indexOf(prevState);

        const next = (current + 1) % product.images.length;

        return product.images[next];
      })
    }, 3000);

    return () => clearInterval(interval);

  }, [product?.images])
  



  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error fetching product data!</p>;

 

  return (
    <div className="w-full overflow-x-scroll  p-8 bg-gray-100 min-h-screen">
    <div className=" bg-white p-6 rounded-lg shadow-lg flex md:flex-row flex-col gap-8 min-h-screen">

        
    {/* {product?.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-[400px] object-contain rounded-lg shadow-md"
          />
        )} */}
        <div className="md:w-[1/2]" >
        <Swiper
        zoom={true}
        navigation={true}
        pagination={{
          clickable: true,
        }}
        modules={[Zoom, Navigation, Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>
          <div className="w-98 h-full">
              <img
                src={selectedImage}
                alt={product?.title}
                className="w-full h-full object-contain rounded-lg shadow-md"
              />
          </div>
        </SwiperSlide>
     

        </Swiper>
        
        {product?.images && product.images.length > 0 && (
          <div className="mt-4 flex flex-row justify-between">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.title} ${index + 1}`}

                className={`w-24 h-24 object-contain rounded-lg shadow-sm cursor-pointer border-2 transition-all duration-300 ${
                  selectedImage === img ? "border-blue-500 scale-105" : "border-transparent"
                  }`}
              
                onClick={() => setSelectedImage(img)}
              />
             
           
            ))}
          </div>
        )}
</div>
     
      <div className="md:w-1/2">
          <h1 className="text-3xl font-semibold text-gray-800">{product?.title}</h1>

          <div className="flex items-end space-x-[15%] mt-2 ">
          <p className="text-lg text-gray-600 mt-2"><strong>Brand:</strong> {product?.brand}</p>
          <p className="text-lg text-gray-600"><strong>Category:</strong> {product?.category}</p>
          </div>
          

          <p className="text-lg text-gray-400"> ⭐ {product?.rating} </p>
          <p className="text-lg text-gray-600"><strong className="text-green-400 font-semibold text-sm">Special Discount Price: </strong></p>

      <div className="flex items-center space-x-[7%] mt-2">
          <span className="font-medium text-neutral-800 text-3xl">${product?.price}</span>
          <p className="text-red-600 font-bold bg-red-100 px-2 py-1 text-xs rounded-md transition duration-300"> {product?.discountPercentage}%</p>
        
          </div>
          <p className="pt-2 text-xl font-medium text-gray-700"> <strong> Description: </strong></p>
          <span className="text-gray-500"> {product?.description}</span>
          
      <div className="mt-4 space-y-2">
         
          <p className="text-gray-700"><strong>Warranty:</strong> {product?.warrantyInformation}</p>
          <p className="text-gray-700"><strong>Shipping:</strong> {product?.shippingInformation}</p>
          <p className="text-gray-700"><strong>Return Policy:</strong> {product?.returnPolicy}</p>
          <p className="text-gray-700"><strong>Min Order Quantity:</strong> {product?.minimumOrderQuantity}</p>
      </div>

       
        <div className="mt-6 flex gap-4">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-300">
            Buy Now
          </button>
          <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition duration-300">
            Add to Cart
          </button>
        </div>


        <Link
          to="/"
          className="inline-block mt-6 text-blue-600 hover:underline"
        >
          ⬅ Go Back
        </Link>
      </div>

    </div>
  </div>
 
 
  )
}

export default ProductdetailPage