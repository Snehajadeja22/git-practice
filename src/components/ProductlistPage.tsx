import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
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
  MaxPrice: Yup.number().typeError("Please enter a valid number"),
  MinPrice: Yup.number().typeError("Please enter a valid number"),
  DiscountRange: Yup.array().of(Yup.string()),
  Rating: Yup.string(),
});

const ProductlistPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState<string>("");
  const [filters, setFilters] = useState<FilterValues>({});

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

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

  const filteredProducts = products ? applyFilters(products) : [];

  return (
    <div className="w-full min-h-screen">
      <div className="flex items-center px-8 justify-between">
        <h1 className="text-5xl font-bold text-left mx-10 mt-10 text-gray-800">
          Store Products
        </h1>

        <Formik
          initialValues={{
            MinPrice: undefined,
            MaxPrice: undefined,
            DiscountRange: [],
            Rating: "",
          }}
          validationSchema={validationSchema}
          onSubmit={setFilters}
        >
          {({ errors, touched }) => (
            <Form>
              <div>
                <label>Max Price</label>
                <Field name="MaxPrice" type="number" />
                {errors.MaxPrice && touched.MaxPrice && (
                  <div>{errors.MaxPrice}</div>
                )}
              </div>
              <div>
                <label>Min Price</label>
                <Field name="MinPrice" type="number" />
                {errors.MinPrice && touched.MinPrice && (
                  <div>{errors.MinPrice}</div>
                )}
              </div>
              <label>Discount:</label>
              {["0%-20%", "21%-40%", "41%-60%", "61%-80%"].map((range) => (
                <label key={range}>
                  <Field type="checkbox" name="DiscountRange" value={range} />
                  {range}
                </label>
              ))}
              <label>
                <Field type="checkbox" name="DiscountRange" value="" /> None
              </label>
              {errors.DiscountRange && touched.DiscountRange && (
                <div>{errors.DiscountRange}</div>
              )}
              <div>
                <label>Rating:</label>
                {[
                  "0 ⭐ & Above",
                  "1 ⭐ & Above",
                  "2 ⭐ & Above",
                  "3 ⭐ & Above",
                  "4 ⭐ & Above",
                ].map((rate) => (
                  <label key={rate}>
                    <Field type="radio" name="Rating" value={rate} />
                    {rate}
                  </label>
                ))}
                <label>
                  <Field type="radio" name="Rating" value="" /> None
                </label>
                {errors.Rating && touched.Rating && <div>{errors.Rating}</div>}
                Rating{" "}
              </div>{" "}
              <div>
                <button type="submit">Apply Filters</button>
              </div>
            </Form>
          )}
        </Formik>

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
              ${product.price.toLocaleString()}
            </div>
            <div className="p-3 bg-white">
              <h2 className="text font-semibold text-gray-800 truncate">
                {product.title}
              </h2>
              <p className="text-yellow-500">⭐ {product.rating} / 5</p>
              <div className="flex items-center justify-between mt-2">
                <p className="font-medium text-neutral-800 text-lg">
                  ${product.price}
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
