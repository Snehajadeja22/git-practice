import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import {  Field, Formik,Form } from "formik"
import * as Yup from "yup";

import { useNavigate } from "react-router-dom"

type Product = {
  id: number
  title: string
  price: number
  images: Array<string>
  discountPercentage: number
  rating: number
}

const ProductlistPage = () => {
  const navigate = useNavigate()
  // const [productlist, setProductlist] = useState<Product[]>();
  // const [error,setError] = useState<string>()
  const [searchvalue, setSearchValue] = useState<string>(" ");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchValue(e.target.value);
  }


  const validationSchema = Yup.object().shape({
    // MaxPrice: Yup.number().typeError("Plese Enter a valid number").required("This field is required"),

    // MinPrice: Yup.number().typeError("Plese Enter a valid number").required("This field is required"),
    MaxPrice: Yup.number()
    .typeError("Please enter a valid number") // First, check if it's a valid number
    .required("This field is required"), // Then, check if it's empty

    MinPrice: Yup.number()
    .typeError("Please enter a valid number") // Validate type first
    .required("This field is required"), // Then, check if it's empty

    DiscountRange: Yup.string().required("Please select a discount range"),
  
    Rating: Yup.string().required("Please select a rating"),
  });
  

  const fetchProducts = async () => {
   return  axios.get<{ products: Product[] }>('https://dummyjson.com/products')
      .then((response) => {
        return response.data.products
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        throw"Something went wrong !"
      });
  }

  const { data: products, error, } = useQuery({
    queryKey: ["products"], // Unique cache key
    queryFn: () => fetchProducts(),
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });
  const [filters, setFilters] = useState<any>()  

  const filteredProducts = products
    ? products.filter((product: Product) =>
      product.title.toLowerCase().includes(searchvalue.toLowerCase()) ||
      product.price.toString().includes(searchvalue)
    
    )
    : [];
  
  const filterByPrice = () => {
    if (!products) return []

    const a = products.filter(product => {
      const price = product.price
      if (price <= filters?.MaxPrice && price >= filters?.MinPrice)
        return true
    })
    
    return a
  }
  const filtered = filterByPrice()
  console.log(filtered)
  
  const goToProduct = (productId: number) => navigate(`/productdetailpage/${productId}`)
  return (
  
    <div className="w-full min-h-screen ">

<div className="flex items-center px-8 justify-between"> 
      <h1 className="text-5xl font-bold text-left mx-10 mt-10 text-gray-800">
        Store Products 
        </h1>
        <Formik 
          initialValues={ {
            MinPrice:0,
            MaxPrice: 0,
            DiscountRange: '',
            Rating: '',
          }}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            setFilters(values)
          }}
        >
          {({ values, errors, touched }) => (
            


            <Form >
              <div>
                <label htmlFor="MaxPrice">Max Price</label>
                <Field
                  
                  name="MaxPrice"
                  type="text"
                  
                />
              {errors.MaxPrice && touched.MaxPrice ? (
                  <div>{errors.MaxPrice}</div>
                ) : null}
                

                </div>

              <div>
                <label htmlFor="MinPrice">Min Price</label>
                <Field
              
                  name="MinPrice"
                  type="text"
                  />
                {errors.MinPrice && touched.MinPrice ? (
                  <div> { errors.MinPrice}</div>
                   ): null}
              </div>
          
        
               
            <label htmlFor="DiscountRange">Discount:</label>
        
              <div>
                <label>
                  <Field
                    type="radio"
                    name="DiscountRange"
                    value="0%-20%"
                  />
                  0-20%
                </label>

                <label>
                  <Field
                    type="radio"
                    name="DiscountRange"
                    value="21%-40%"
                  />
                  21-40%
                </label>

                <label>
                  <Field
                    type="radio"
                    name="DiscountRange"
                    value="41%-60%"
                  />
                  41%-60%
                </label>
                <label>
                  <Field
                    type="radio"
                    name="DiscountRange"
                    value="61%-80%"
                  />
                  61-80%
                </label>
                <div>Applied: {values.DiscountRange}</div>
              </div>

              <label htmlFor="Rating">Ratings:</label>
              <div>
              <label>
                  <Field
                    type="radio"
                    name="Rating"
                    value="1 ⭐ & Above"
                  />
                    1 ⭐ & Above
                </label>

                <label>
                  <Field
                    type="radio"
                    name="Rating"
                    value="2 ⭐ & Above"
                  />
                    2 ⭐ & Above
                </label>

                <label>
                  <Field
                    type="radio"
                    name="Rating"
                    value="3 ⭐ & Above"
                  />
                    3 ⭐ & Above
                </label>

                <label>
                  <Field
                    type="radio"
                    name="Rating"
                    value="4 ⭐ & Above"
                  />
                    4 ⭐ & Above
                </label>

                <label>
                  <Field
                    type="radio"
                    name="Rating"
                    value="5 ⭐ & Above"
                  />
                    5 ⭐ & Above
                </label>
                <div>Applied: {values.Rating}</div>
              </div>
              <button type="submit">Submit</button>
            </Form>
          )}
          </Formik>
     
       <input type="search" id="search-form" className="search-input w-80 p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={handleSearch}
          placeholder="Search here..." />
      
    </div>

      
      
      {!products && !error && (
        <p className="text-center text-blue-500">Loading...</p>
      )}
      {error && <p className="text-center text-red-400">Error! {error.toString()}</p>}

      
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-10 p-10">
        { filtered && filtered.map((product) => (
            <div
              key={product.id}
              onClick={()=>goToProduct(product.id)}
              className="relative bg-gray-50 rounded-lg  overflow-hidden transition duration-300 shadow hover:cursor-pointer"
            >

              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-40 object-contain"
              />

            
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-md">
                ${product.price.toLocaleString()}
              </div>

            
              <div className="p-3 bg-white">
                <h2 className="text font-semibold text-gray-800 truncate">
                  {product.title}
                </h2>

                <p className="text-yellow-500">
                      ⭐ {product.rating} / 5
                </p>
                

                <div className="flex items-center justify-between mt-2">
                  <p className="font-medium text-neutral-800 text-lg">${product?.price}</p>
                  
                    <span className="text-green-600 font-bold bg-green-100 px-2 py-1 text-xs rounded-md transition duration-300">
                      {product.discountPercentage}% off
                    </span>
                </div>

               <div className="flex items-center space-x-0">
                
                {/* <Link
                  to={`/productdetailpage/${product.id}`}
                  className="mt-4 inline-block w-full text-center bg-purple-400 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition duration-300 text-lg"
                >
                  View Details
                  </Link> */}

                  </div>
              </div>
            </div>
          ))}
      </div>
      </div>
     
  );
  
  
}

export default ProductlistPage
