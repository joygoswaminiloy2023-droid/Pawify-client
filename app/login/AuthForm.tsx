"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, CheckCircle2, User, Store, Loader2, PawPrint } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: "",
      role: "user",
      shopName: "",
      shopDescription: "",
    },
  });

  const currentRole = watch("role");

  useEffect(() => {
    if (searchParams.get("error") === "banned") {
      toast.error("Your account has been permanently banned.");
    }
  }, [searchParams]);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowPassword(false);
    reset({
      name: "",
      email: "",
      password: "",
      image: "",
      role: "user",
      shopName: "",
      shopDescription: "",
    });
  };

  const syncToken = async () => {
    try {
      const { data } = await authClient.token();
      if (data?.token) localStorage.setItem("bearer_token", data.token);
    } catch (err) {
      console.error("Failed to sync token:", err);
    }
  };

  // Poll until the session cookie is actually live before firing any
  // authenticated request right after signup/login. Prevents a race
  // where /api/vendor/apply (or /api/vendor/status) is called before
  // the browser has the fresh session cookie, causing a silent 401.
  const waitForSession = async (maxAttempts = 6, delayMs = 300) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const { data } = await authClient.getSession();
        if (data?.user) return data.user;
      } catch (err) {
        console.error("Session check failed:", err);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return null;
  };

  const redirectBasedOnRole = async (role: string) => {
    toast.success(isLogin ? "Welcome back!" : "Account created!");
    setTimeout(() => {
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "vendor") {
        router.push("/dashboard/vendor");
      } else {
        router.push("/");
      }
      router.refresh();
    }, 800);
  };

  const checkPendingVendorApplication = async () => {
    try {
      const statusRes = await api.get("/api/vendor/status");
      return !!statusRes.data?.hasPendingApplication;
    } catch (err) {
      console.error("Failed to check vendor status:", err);
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await authClient.signIn.social(
        {
          provider: "google",
           callbackURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/",
        },
        {
          onSuccess: async (ctx: any) => {
            await syncToken();
            const userRole = ctx?.data?.user?.role || "user";

            if (userRole === "user") {
              const hasPending = await checkPendingVendorApplication();
              if (hasPending) {
                toast.info("Your vendor application is pending admin approval.");
                setTimeout(() => {
                  router.push("/vendors/waiting");
                  router.refresh();
                }, 1000);
                return;
              }
            }

            redirectBasedOnRole(userRole);
          },
          onError: (err: any) => {
            if (err.message?.includes("banned")) {
              toast.error("Your account has been banned.");
            } else {
              toast.error(err.message || "Google sign-in failed");
            }
          },
        }
      );
      console.log(error, data);
    } catch (err) {
      console.error(err);
      toast.error("Google sign-in failed");
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (!isLogin) {
        const strongPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
        if (!strongPasswordRegex.test(data.password)) {
          toast.error("Password: min 6 chars, 1 number & 1 special char");
          return;
        }

        if (data.role === "vendor" && (!data.shopName || !data.shopDescription)) {
          toast.error("Shop name and description are required to apply as a vendor.");
          return;
        }
      }

      if (isLogin) {
        const { data: loginData, error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (error) {
          toast.error(error.message || "Login failed");
          return;
        }

        await syncToken();

        // Make sure the session cookie is actually live before checking status
        const sessionUser = await waitForSession();
        const userRole = sessionUser?.role || loginData?.user?.role || "user";

        if (userRole === "user") {
          const hasPending = await checkPendingVendorApplication();
          if (hasPending) {
            toast.info("Your vendor application is pending admin approval.");
            setTimeout(() => {
              router.push("/vendors/waiting");
              router.refresh();
            }, 1000);
            return;
          }
        }

        redirectBasedOnRole(userRole);
      } else {
        // SIGN UP
        const { data: signupData, error } = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
          image: data.image || undefined,
        });

        if (error) {
          toast.error(error.message || "Sign up failed");
          console.log("Sign up error:", error);
          return;
        }

        await syncToken();

        // Wait for the session to actually be live before hitting any
        // authenticated endpoint — this is what was causing the silent
        // redirect to "/" instead of the vendor waiting page.
        const sessionUser = await waitForSession();
        if (!sessionUser) {
          console.error("Session never became available after signup.");
          toast.error("Account created, but we couldn't confirm your session. Please log in.");
          setTimeout(() => {
            router.push("/login");
            router.refresh();
          }, 1200);
          return;
        }

        if (data.role === "vendor") {
          try {
            console.log("Submitting vendor application...");
            await api.post("/api/vendor/apply", {
              shopName: data.shopName,
              description: data.shopDescription,
            });

            toast.success("Account created! Your vendor application is pending admin approval.");

            setTimeout(() => {
              router.push("/vendors/waiting");
              router.refresh();
            }, 1500);
          } catch (err: any) {
            console.error("Vendor application error:", err);
            toast.error(
              err.message ||
                "Account created, but vendor application failed. You can apply again from your dashboard."
            );
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 1200);
          }
        } else {
          redirectBasedOnRole("user");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-200 p-4 md:p-6 font-sans">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="relative w-full max-w-[1000px] min-h-[720px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* FORM PANEL */}
        <div
          className={`w-full md:w-1/2 h-full flex flex-col justify-center px-8 sm:px-16 py-10 transition-all duration-700 ease-in-out z-10 ${
            isLogin ? "md:translate-x-0" : "md:translate-x-full"
          }`}
        >
          <div className="mb-4 mt-10">
            <div className="flex justify-center md:justify-start items-center gap-2 mb-2">
              <PawPrint className="w-6 h-6 text-teal-600" />
              <span className="font-bold text-xl text-teal-700">Pawify</span>
            </div>
            <h2 className="text-3xl text-center md:text-left font-bold text-slate-900">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Account Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("role", "user")}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs transition-all ${
                        currentRole === "user"
                          ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <User size={16} />
                      Pet Owner
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("role", "vendor")}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs transition-all ${
                        currentRole === "vendor"
                          ? "border-teal-500 bg-teal-50 text-teal-700 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Store size={16} />
                      Vendor
                    </button>
                  </div>
                  {currentRole === "vendor" && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-1">
                      Vendor accounts require admin approval after signup. You'll be redirected to a waiting page after registration.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    {...register("name", { required: !isLogin })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                    Profile Image (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    {...register("image")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                {currentRole === "vendor" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Happy Paws Supplies"
                        {...register("shopName", { required: currentRole === "vendor" })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                        Shop Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What do you sell?"
                        {...register("shopDescription", { required: currentRole === "vendor" })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all resize-none"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message as string}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl transition-all font-semibold text-slate-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <p className="mt-4 text-center text-slate-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleAuthMode}
              className="ml-2 text-teal-700 font-bold underline hover:no-underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        {/* DECORATIVE PANEL */}
        <div
          className={`hidden md:flex absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out z-20 flex-col items-center justify-center text-white px-12 text-center ${
            isLogin ? "translate-x-full" : "translate-x-0"
          }`}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-teal-700/80 mix-blend-multiply z-0"></div>
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] z-0"></div>
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl font-extrabold leading-tight">
              {isLogin ? "Join the Pawify family" : "Welcome back"}
            </h2>
            <div className="space-y-4 text-white/90">
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Shop from verified pet vendors
              </p>
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Fast delivery across Bangladesh
              </p>
              <p className="flex items-center gap-3 justify-center">
                <CheckCircle2 size={18} className="text-emerald-400" />
                Secure Stripe checkout
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAuthMode}
              className="mt-8 px-10 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-md rounded-full font-bold hover:bg-white hover:text-teal-700 transition-all flex items-center gap-2 mx-auto"
            >
              {isLogin ? "SIGN UP NOW" : "SIGN IN TO ACCOUNT"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}