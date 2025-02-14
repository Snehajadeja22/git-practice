import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Field, Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

// Define types
interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
  discountPercentage: number;
  rating: number;
}

// governmentOfIndia
interface FilterValues {
  MinPrice?: number;
  MaxPrice?: number;
  DiscountRange?: string[];
  Rating?: string;
}

const validationSchema = Yup.object().shape({
  // MaxPrice: Yup.number().typeError("Please enter a valid number"),
  // MinPrice: Yup.number().typeError("Please enter a valid number"),
  MaxPrice: Yup.string()
    .transform((value: string) => value.replace(/,/g, "")) // Remove commas before validation
    .test("Please enter a valid number", (value: string | undefined) => {
      if (!value) return true;
      return !isNaN(Number(value));
    }),

  MinPrice: Yup.string()
    .transform((value) => value.replace(/,/g, ""))
    .test("Please enter a valid number", (value: string | undefined) => {
      if (!value) return true;
      return !isNaN(Number(value));
    }),
  DiscountRange: Yup.array().of(Yup.string()),
  Rating: Yup.string(),
});

const ProductlistPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [isOpen, setIsOpen] = useState(false);
  // const [price, setPrice] = useState<string>("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const inputValue = e.target.value;
  //   const formattedPrice = formatPrice(inputValue);

  //   setPrice(formattedPrice ? `$${formattedPrice}` : " ");
  // };

  const fetchProducts = async (): Promise<Product[]> => {
    const response = await axios.get<{ products: Product[] }>(
      "https://dummyjson.com/products"
    );
    return response.data.products;
  };

  const { data: products, error } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  const applyFilters = (products: Product[]): Product[] => {
    return products.filter((product) => {
      const meetsPriceCriteria =
        (!filters.MinPrice || product.price >= filters.MinPrice) &&
        (!filters.MaxPrice || product.price <= filters.MaxPrice);

      const meetsDiscountCriteria =
        filters.DiscountRange && filters.DiscountRange.length > 0
          ? filters.DiscountRange.some((range) => {
              const [min, max] = range.split("%-").map(Number); // ✅ Correctly splits each selected range
              return (
                product.discountPercentage >= (min || 0) &&
                product.discountPercentage <= (max || 100)
              );
            })
          : true;

      const meetsRatingCriteria = filters.Rating
        ? (() => {
            const [min, max] = filters.Rating.split("⭐ & Above").map(Number);
            return product.rating >= (min || 0) && product.rating <= (max || 5);
          })()
        : true;

      const meetsSearchCriteria =
        product.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.price.toString().includes(searchValue);

      return (
        meetsPriceCriteria &&
        meetsDiscountCriteria &&
        meetsSearchCriteria &&
        meetsRatingCriteria
      );
    });
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    const numericValue = value.replace(/[^0-9.]/g, ""); // Allow only numbers & decimals

    // Format with commas for thousands separator
    const [integer, decimal] = numericValue.split(".");
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decimal !== undefined
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;
  };

  const filteredProducts = products ? applyFilters(products) : [];

  // const modalRef = useRef<HTMLDivElement>(null); // Ref for the pop-up

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       modalRef.current &&
  //       !modalRef.current.contains(event.target as Node)
  //     ) {
  //       setIsOpen(false); // Close modal when clicking outside
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener("mousedown", handleClickOutside); // Attach listener
  //   } else {
  //     document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener
  //   }

  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, [isOpen]);

  return (
    <div className="w-full min-h-screen">
      <div className="flex items-center px-8 justify-between">
        <h1 className="text-5xl font-bold text-left mx-10 mt-10 text-gray-800">
          Store Products
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Filter
        </button>
        {isOpen && (
          // <div
          //   ref={modalRef} // Attach ref to modal
          // >
          <div className="absolute top-20 right-10 w-96 bg-white p-6 shadow-lg rounded-lg border border-gray-300 z-50">
            <Formik
              initialValues={{
                MinPrice: undefined,
                MaxPrice: undefined,
                DiscountRange: [],
                Rating: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => {
                setFilters(values);
                console.log(values);
                setIsOpen(false); // Close modal after submit
              }}
            >
              {({ values, errors, touched, setFieldValue, resetForm }) => {
                console.log(values);
                return (
                  <Form className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 space-y-4">
                    {/* MAX Price */}
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-900">
                        Max Price
                      </label>
                      {/* <div className="relative w-64">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 bg-gray-200 px-2 rounded-l-md text-gray-700">
                        $
                      </span>
                      <input
                        type="text"
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        placeholder="Enter amount"
                      />
                    </div> */}

                      <div className="relative w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3  px-2 rounded-l-md font-medium text-gray-600 border border-gray-300 bg-slate-50">
                          $
                        </span>

                        <Field
                          name="MaxPrice"
                          type="text"
                          value={values.MaxPrice || ""}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          // onChange={(
                          //   e: React.ChangeEvent<HTMLInputElement>
                          // ) => {
                          //   const formattedValue = formatCurrency(
                          //     e.target.value
                          //   );
                          //   setFieldValue("MaxPrice", formattedValue);
                          // }}
                        />
                      </div>

                      {errors.MaxPrice && touched.MaxPrice && (
                        <div>{errors.MaxPrice}</div>
                      )}
                    </div>

                    {/* Min Price */}
                    <div className="flex flex-col">
                      <label className="font-medium text-gray-900">
                        Min Price
                      </label>

                      <div className="relative w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3  px-2 rounded-l-md font-medium text-gray-600 border border-gray-300 bg-slate-50">
                          $
                        </span>

                        <Field
                          name="MinPrice"
                          type="text"
                          value={values.MinPrice || ""}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const formattedValue = formatCurrency(
                              e.target.value
                            );
                            setFieldValue("MinPrice", formattedValue);
                          }}
                        />
                      </div>
                      {errors.MinPrice && touched.MinPrice && (
                        <div>{errors.MinPrice}</div>
                      )}
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="font-medium text-gray-900">
                        Discount:
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[" 0%-20%", " 21%-40%", " 41%-60%", " 61%-80%"].map(
                          (range) => (
                            <label
                              key={range}
                              className="flex items-center space-x-2 text-gray-700"
                            >
                              <Field
                                type="checkbox"
                                name="DiscountRange"
                                value={range}
                                className="w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded-md"
                              />
                              {range}
                            </label>
                          )
                        )}
                        <label className="flex items-center space-x-2 text-gray-700">
                          <Field
                            type="checkbox"
                            name="DiscountRange"
                            value=" "
                            className="w-5 h-5 text-blue-500 focus:ring-blue-400 border-gray-300 rounded-md"
                          />
                          <span> None</span>
                        </label>
                      </div>
                      {errors.DiscountRange && touched.DiscountRange && (
                        <div>{errors.DiscountRange}</div>
                      )}
                    </div>
                    {/* Rating */}
                    <div>
                      <label className="font-medium text-gray-900">
                        Rating:
                      </label>
                      <div className="flex flex-col mt-1 space-y-2">
                        {[
                          "0 ⭐ & Above",
                          "1 ⭐ & Above",
                          "2 ⭐ & Above",
                          "3 ⭐ & Above",
                          "4 ⭐ & Above",
                        ].map((rate) => (
                          <label
                            key={rate}
                            className="flex items-center space-x-2  text-gray-700"
                          >
                            <Field
                              type="radio"
                              name="Rating"
                              value={rate}
                              className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded-full"
                            />
                            {rate}
                          </label>
                        ))}
                        <label className="flex items-center space-x-2 text-gray-700">
                          <Field
                            type="radio"
                            name="Rating"
                            value=""
                            className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded-full"
                          />
                          None
                        </label>
                      </div>
                      {errors.Rating && touched.Rating && (
                        <div>{errors.Rating}</div>
                      )}
                    </div>
                    {/* Submit */}
                    <div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Apply Filters
                      </button>
                    </div>

                    <button
                      type="reset"
                      onClick={() => resetForm()}
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      Reset
                    </button>
                  </Form>
                );
              }}
            </Formik>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
          // </div>
        )}

        <input
          type="search"
          className="search-input w-80 p-3 border border-gray-300 rounded-lg shadow-md"
          onChange={handleSearch}
          placeholder="Search here..."
        />
      </div>

      {error && (
        <p className="text-center text-red-400">Error! {error.toString()}</p>
      )}
      {!products && !error && (
        <p className="text-center text-blue-500">Loading...</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-10 p-10">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/productdetailpage/${product.id}`)}
            className="relative bg-gray-50 rounded-lg overflow-hidden transition duration-300 shadow hover:cursor-pointer"
          >
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-40 object-contain"
            />
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-full shadow-md">
              {product.price.toLocaleString()}
            </div>
            <div className="p-3 bg-white">
              <h2 className="text font-semibold text-gray-800 truncate">
                {product.title}
              </h2>
              <p className="text-yellow-500">⭐ {product.rating} / 5</p>
              <div className="flex items-center justify-between mt-2">
                <p className="font-medium text-neutral-800 text-lg">
                  {product.price}
                </p>
                <span className="text-green-600 font-bold bg-green-100 px-2 py-1 text-xs rounded-md">
                  {product.discountPercentage}% off
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductlistPage;
