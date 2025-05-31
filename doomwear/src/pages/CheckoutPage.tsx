import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import axios, { isAxiosError } from "axios";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface ProductSelection {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  subtotal: number;
  image: string;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters." }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters." }),
  address: z
    .string()
    .min(5, { message: "Please enter your complete address." }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: "City is required." }),
  state: z.string().min(2, { message: "State is required." }),
  pinCode: z
    .string()
    .regex(/^\d{6}$/, { message: "PIN code must be 6 digits." }),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, { message: "Card number must be 16 digits." }),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
      message: "Expiry date must be in MM/YY format.",
    })
    .refine(
      (val) => {
        const [month, year] = val.split("/");
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        return expiry > new Date();
      },
      { message: "Card has expired." }
    ),
  cvv: z.string().regex(/^\d{3}$/, { message: "CVV must be 3 digits." }),
  saveInfo: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const [productSelection, setProductSelection] =
    useState<ProductSelection | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingResult, setProcessingResult] = useState<
    "success" | "declined" | "error" | null
  >(null);
  const [selectEndStatus, setSelectEndStatus] = useState<string>("random");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: "",
      lastName: "",
      address: "",
      apartment: "",
      city: "",
      state: "",
      pinCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      saveInfo: false,
    },
  });

  useEffect(() => {
    const savedSelection = localStorage.getItem("productSelection");
    if (savedSelection) {
      const parsed = JSON.parse(savedSelection);
      setProductSelection(parsed);
    } else {
      // toast({
      //   title: "No product selected",
      //   description: "Please select a product first.",
      //   variant: "destructive"
      // });
      navigate("/");
    }
  }, [navigate]);

  const simulateTransaction = (): Promise<"success" | "declined" | "error"> => {
    return new Promise((resolve) => {
      const outcomes: ("success" | "declined" | "error")[] = [
        "success",
        "declined",
        "error",
      ];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setTimeout(() => {
        resolve(result);
      }, 2000);
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!productSelection) return;

    setLoading(true);

    try {
      const transactionResult =
        selectEndStatus === "random"
          ? await simulateTransaction()
          : selectEndStatus;

      const orderData = {
        userId: user?._id,
        customerInfo: {
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          address: data.address,
          apartment: data.apartment,
          city: data.city,
          state: data.state,
          pinCode: data.pinCode,
        },
        product: {
          _id: productSelection.product._id,
          name: productSelection.product.name,
          price: productSelection.product.price,
          color: productSelection.selectedColor,
          size: productSelection.selectedSize,
          quantity: productSelection.quantity,
          image: productSelection.product.image,
        },
        totalAmount: getTotalAmount(productSelection.subtotal),
        status: transactionResult,
        orderNumber: `ORD-${Date.now().toString().substring(7)}`,
      };

      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/v1/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProcessingResult(response.data.status);

      setTimeout(() => {
        if (response.data.status === "success") {
          navigate(`/thank-you/${response.data.order._id}`);
        } else {
          navigate(`/failure/${response.data.order._id}`);
        }
      }, 1500);
    } catch (error) {
      console.error("Error processing order:", error);
      // toast({
      //   title: "Error",
      //   description: "There was a problem processing your order. Please try again.",
      //   variant: "destructive"
      // });
      if(isAxiosError(error)) {
       const ahah = error?.response?.data;
        setError(ahah.message)
      }
      setLoading(false);
      setProcessingResult("error");
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (value.length <= 16 && /^\d*$/.test(value)) {
      const formattedValue = formatCardNumber(value);
      e.target.value = formattedValue;
      form.setValue("cardNumber", value);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
    form.setValue("expiryDate", value);
  };

  if (!productSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const estimatedTax = Math.round(productSelection.subtotal * 0.18); // 18% GST in India
  const getTotalAmount = (amount: number) => {
    return (amount + estimatedTax).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Contact Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Contact</h2>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Delivery Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Delivery</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="First name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="apartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Apartment, suite, etc. (optional)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="State" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="pinCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="PIN code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Payment</h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                          <span>Credit card</span>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="cardNumber"
                        render={({ field: { ...fieldProps } }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Card number"
                                {...fieldProps}
                                onChange={handleCardNumberChange}
                                maxLength={19}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field: { ...fieldProps } }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="MM/YY"
                                  {...fieldProps}
                                  onChange={handleExpiryDateChange}
                                  maxLength={5}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Security code (CVV)"
                                  type="password"
                                  maxLength={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {["success", "declined", "error", "random"].map(
                      (status) => (
                        <Button type="button" 
                        onClick={() => setSelectEndStatus(status)}
                        className={`px-3 py-2 text-sm ${selectEndStatus === status ? "bg-amber-400" : ""}`}>{status.toUpperCase()}</Button>
                      )
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center text-white">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="text-white font-medium">Pay now</span>
                    )}
                  </Button>

                  {processingResult && (
                    <div
                      className={`p-4 rounded-lg flex items-center space-x-2 ${
                        processingResult === "success"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {processingResult === "success" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span>
                        {processingResult === "success"
                          ? "Payment successful! Redirecting..."
                          : processingResult === "declined"
                          ? "Payment declined. Please try another card."
                          : processingResult === "error"
                          ? error ? error : "Some Error Occured. Cannot place Order"
                          : "Payment error. Please try again later."}
                      </span>
                    </div>
                  )}
                </form>
              </Form>
            </motion.div>
          </div>

          <div className="lg:pl-8">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-8">
              <div className="space-y-4">
                {/* Product Details */}
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={productSelection.product.image}
                      alt={productSelection.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {productSelection.product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {productSelection.selectedColor} /{" "}
                      {productSelection.selectedSize}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {productSelection.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{productSelection.product.price}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{productSelection.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      Estimated taxes
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </span>
                    <span>₹{estimatedTax}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{getTotalAmount(productSelection.subtotal)}</span>
                  {/* <span>₹{(productSelection.subtotal + estimatedTax).toFixed(2)}</span> */}
                </div>

                {/* Secure Transaction Notice */}
                <div className="mt-6 flex items-center text-sm text-gray-500">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Transactions are secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
