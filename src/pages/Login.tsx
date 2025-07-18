
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form } from "formik";

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import InputField from '@/components/forms/InputField';
import AuthLayout from '@/components/layouts/AuthLayout';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { FormError } from '@/components/stack/stack';

import { mobileNumberSchema, otpSchema } from '@/schema/common';
import { logHelper } from '@/utils/utils';


import { useLoginMutation, useLoginVerifyOtpMutation } from '@/lib/api/commonApi';


const TAG: string = 'Login: ';
const Login = () => {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    mutate: loginSendOtp,
    // isLoading: isSendOtpLoading,
    // isError: isShippingChargeError,
  } = useLoginMutation({
    enabled: false
  });

  const {
    mutate: loginVerifyOtp,
    // isLoading: isSendOtpLoading,
    // isError: isShippingChargeError,
  } = useLoginVerifyOtpMutation({
    enabled: false
  });

  const affiliateId = searchParams.get('affiliateId') || '';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const otpInitialValues = { otp: '' };

  const phoneInitialValues = { mobileNumber: '' };

  const handleSendOtp = async (values: any) => {

    logHelper(TAG, " ===> handleSendOtp", values);

    setIsLoading(true);

    try {
      const formData = { mobile: values.mobileNumber.toString() };

      loginSendOtp(formData, {
        onSuccess: (res: any) => {

          logHelper(TAG, " ===> res", res);

          if (res?.status !== 200 || res?.success !== true) {
            toast({ title: "Failed to Send OTP", description: res?.msg || "Something went wrong", variant: "destructive" });
          } else {
            toast({ title: res?.msg, variant: "default" });
            setStep('otp');
          }

        },
        onError: (err: any) => {
          logHelper(TAG, " ===> err", err);
          toast({ title: "Failed to Send OTP", description: err?.data?.message || "Something went wrong", variant: "destructive" });
        }
      })

    } catch (error: any) {
      logHelper(TAG, " ===> API Error", error);
    } finally {
      setIsLoading(false);
    }

  };


  const handleVerifyOtp = async (values: any) => {

    logHelper(TAG, " ===> handleVerifyOtp", values);

    setIsLoading(true);

    try {
      const formData = { mobile: values.mobileNumber.toString().trim(), otp: values.otp.toString().trim() };

      loginVerifyOtp(formData, {
        onSuccess: (res: any) => {

          logHelper(TAG, " ===> res", res);

          if (res?.status !== 200 || res?.success !== true) {
            toast({ title: "Failed to Verify OTP", description: res?.msg || "Something went wrong", variant: "destructive" });
          } else {
            toast({ title: res?.msg, variant: "default" });

            localStorage.setItem('auth_token', res?.result?.accessToken);
            localStorage.setItem('refresh_token', res?.result?.refreshToken);
            localStorage.setItem('user_details', JSON.stringify(res?.result?.user));

            navigate('/dashboard');
          }

        },
        onError: (err: any) => {
          logHelper(TAG, " ===> err", err);
          toast({ title: "Failed to Verify OTP", description: err?.response?.data?.msg || "Something went wrong", variant: "destructive" });
        }
      })

    } catch (error: any) {
      logHelper(TAG, " ===> API Error", error);

    } finally {
      setIsLoading(false);
    }

  };


  if (step === 'otp') {
    return (
      <AuthLayout
        title="Verify OTP"
        subtitle="Enter the 6-digit code sent to your phone"
      >
        <Formik
          initialValues={otpInitialValues}
          validationSchema={otpSchema}
          onSubmit={handleVerifyOtp}
          onKeyDown={(e: any, values: any) => {
            if (e.key === "Enter") {
              handleVerifyOtp(values);
            }
          }}
          name="otpForm"
          id="otpForm"
        >
          {({ values, errors, touched, setFieldValue, handleSubmit }: any) => (
            <Form>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">  Enter OTP </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={values.otp}
                    onChange={(value) => { setFieldValue('otp', value); }}
                    name="otp"
                    id="otp"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>} */}
                {errors.otp && <FormError errors={errors} />}

              </div>

              <Button
                type="submit"
                className="w-full bg-myntra-purple hover:bg-myntra-dark mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>

            </Form>
          )}
        </Formik>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep('phone')}
          className="w-full"
        >
          Back to Phone Number
        </Button>

      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Login to Your Account"
      subtitle="Access your Myntra Affiliate dashboard"
    >
      <Formik
        initialValues={phoneInitialValues}
        validationSchema={mobileNumberSchema}
        onSubmit={(values: any) => {
          handleSendOtp(values);
        }}
        onKeyDown={(e: any, values: any) => {
          if (e.key === "Enter") {
            handleSendOtp(values);
          }
        }}
        name="phoneForm"
        id="phoneForm"
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <Form>

            <InputField
              label="Phone Number"
              type="tel"
              name="mobileNumber"
              id="mobileNumber"
              placeholder="Enter your phone number"
              value={values.mobileNumber}
              onChange={(e: any) => {
                setFieldValue('mobileNumber', e.target.value);
              }}
              className="!mb-0 "
            />
            {errors.mobileNumber && <FormError errors={errors} />}

            <Button
              type="submit"
              className="w-full bg-myntra-purple hover:bg-myntra-dark mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </Button>

            {affiliateId && (<p className="text-xs text-gray-500 text-center"> Affiliate ID: {affiliateId}  </p>)}
          </Form>
        )}
      </Formik>

    </AuthLayout>
  );
};

export default Login;
