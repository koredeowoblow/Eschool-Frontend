import { useState } from 'react';

interface FormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useFormSubmit(submitFn: (data: any) => Promise<any>, options?: FormSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const submit = async (formData: any) => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await submitFn(formData);
      options?.onSuccess?.(result);
      return { success: true, data: result };
    } catch (error: any) {
      // Handle Laravel 422 Validation Errors from the API interceptor
      const apiResponse = error.originalError?.response;
      if (apiResponse?.status === 422 && apiResponse.data?.errors) {
        setErrors(apiResponse.data.errors);
      } else {
        console.error("Non-validation error caught in form submit:", error);
      }
      options?.onError?.(error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, errors, setErrors };
}