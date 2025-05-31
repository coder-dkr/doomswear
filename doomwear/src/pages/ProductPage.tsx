import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { type Product } from "@/types/types";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL

const ProductPage = () => {
  const { data: products = [], isLoading ,error } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/v1/products`);
      if (!response.data) {
        throw new Error("Failed to fetch products");
      }
      return response.data;
    },
  });


  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  useEffect(() => {
    if (products.length > 0 && !activeProductId) {
      setActiveProductId(products[0]?._id ?? null);
    }
  }, [products, activeProductId]);

  const PRODUCT = products.find(p => p._id === activeProductId);
  const relatedProducts = products.filter((p) => p._id !== activeProductId).slice(0, 6);




  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (PRODUCT) {
      setSelectedColor(PRODUCT.colors[0]?.name || "");
      setSelectedSize(PRODUCT.sizes[1] || "");
    }
  }, [PRODUCT]);

  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      // toast({
      //   title: "Authentication Required",
      //   description: "Please login to continue with your purchase.",
      //   variant: "destructive"
      // });
      navigate("/login", { state: { from: "/" } });
      return;
    }

    const productSelection = {
      product: {
        _id : PRODUCT?._id,
        name: PRODUCT?.name,
        price: PRODUCT?.price,
        image: PRODUCT?.images[PRODUCT?.colors.findIndex(color => color.name === selectedColor) ?? 0]
      },
      quantity,
      selectedColor,
      selectedSize,
      subtotal: quantity * (PRODUCT?.price ?? 0),
    };

    localStorage.setItem("productSelection", JSON.stringify(productSelection));
    navigate("/checkout");
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
    )
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center">Error loading products</div>;
  }

  if(!PRODUCT) {
    return <div className="container mx-auto px-4 py-8 text-center">Product Not Found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 ">
    
          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square bg-">
            <img
              src={PRODUCT?.images[activeImageIndex]}
              alt={PRODUCT?.name}
              className="object-contain w-full h-full"
            />
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white shadow-md"
              onClick={() =>
                setActiveImageIndex((prev) =>
                  prev === 0 ? PRODUCT?.images.length - 1 : prev - 1
                )
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white shadow-md"
              onClick={() =>
                setActiveImageIndex(
                  (prev) => (prev + 1) % PRODUCT?.images.length
                )
              }
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex  space-x-2">
            {PRODUCT?.images.map((image, index) => (
              <button
                key={index}
                className={`relative w-24 h-24 rounded-md overflow-hidden  !outline-none ${
                  activeImageIndex === index
                    ? "ring-2 ring-pink-500"
                    : "opacity-70"
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`${PRODUCT.name} view ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold mb-2">{PRODUCT?.name}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <span className="text-gray-500">(126 reviews)</span>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl font-bold">₹{PRODUCT?.price}</span>
              <span className="text-gray-500 line-through">
                ₹{PRODUCT?.originalPrice}
              </span>
              <span className="text-green-600 font-medium">
                {PRODUCT?.price && Math.round((1 - PRODUCT?.price / PRODUCT?.originalPrice) * 100)}%
                off
              </span>
            </div>

            <p className="text-gray-700 mb-6">{PRODUCT?.description}</p>
            <p className="text-gray-700 mb-6">Inventory: {PRODUCT?.inventory}</p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">
                  Color: <span className="font-normal">{selectedColor}</span>
                </h3>
                <div className="flex space-x-4">
                  {PRODUCT.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`w-10 h-10 rounded-full !border-0 !outline-none ${
                        color.colorClass
                      } flex items-center justify-center transition-all ${
                        selectedColor === color.name
                          ? "ring-2 ring-offset-2 ring-pink-500"
                          : "ring-1 ring-offset-1 ring-gray-300"
                      }`}
                      style={{background : color.value}}
                      onClick={() => {
                        setSelectedColor(color.name)
                        setActiveImageIndex(PRODUCT.colors.indexOf(color))
                      }}
                      aria-label={`Select ${color.name} color`}
                    >
                      {selectedColor === color.name && (
                        <Check className="h-5 w-5 z-50 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">
                    Size: <span className="font-normal">{selectedSize}</span>
                  </h3>
                  <button className="text-sm text-pink-600 hover:underline">
                    Size Guide
                  </button>
                </div>

                <RadioGroup
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                  className="flex flex-wrap gap-2"
                >
                  {PRODUCT.sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className="w-12 h-10 rounded border border-gray-300 flex items-center justify-center cursor-pointer peer-focus:ring-2 peer-focus:ring-pink-500 peer-checked:bg-pink-50 peer-checked:border-pink-500 peer-checked:text-pink-600 transition-all"
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Quantity Selection */}
              <div>
                <h3 className="font-semibold mb-3">Quantity:</h3>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="default"
                  size="lg"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
                <Button variant="outline" className="border-gray-300">
                  <Heart className="h-5 w-5 text-pink-600" />
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-black"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </div>

              {/* Product Highlights */}
              <div className="border border-gray-200 rounded-lg p-4 mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Product Highlights</span>
                </div>
                <ul className="space-y-2">
                  {PRODUCT.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Product Specifications */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Product Specifications</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 bg-gray-50">
              <p className="font-medium">Material</p>
            </div>
            <div className="p-4 border-b border-gray-200">
              <p>80% Cotton, 20% Polyester</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 bg-gray-50">
              <p className="font-medium">Care Instructions</p>
            </div>
            <div className="p-4 border-b border-gray-200">
              <p>Machine wash cold, tumble dry low</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 bg-gray-50">
              <p className="font-medium">Country of Origin</p>
            </div>
            <div className="p-4 border-b border-gray-200">
              <p>India</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-4 bg-gray-50">
              <p className="font-medium">Weight</p>
            </div>
            <div className="p-4">
              <p>350 grams</p>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {relatedProducts.map((product, index) => (
              <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 m-1 cursor-pointer">
                <Card 
                onClick={() => {
                  setActiveProductId(product._id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="border-none">
                  <CardContent className="p-0">
                    <div className="overflow-hidden rounded-lg mb-2 aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform hover:scale-105"
                      />
                    </div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1 p-1">
                      <span className="font-bold">{product.price}</span>
                      <span className="text-green-600 text-sm">{Math.round((1 - product?.price / product?.originalPrice) * 100)}% off</span>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      {/* Customer Reviews Section */}
      {/* <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="font-medium text-gray-600">{String.fromCharCode(65 + index)}</span>
                </div>
                <div>
                  <p className="font-medium">Customer {index + 1}</p>
                  <div className="flex text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">
                Love this hoodie! The design is so cute and the fabric is really comfortable. 
                Fits perfectly and has become my go-to for casual outings.
              </p>
              <p className="text-gray-500 text-sm mt-2">Posted on {new Date().toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default ProductPage;
