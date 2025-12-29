
import { useState } from 'react';

interface FormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (errors: any) => void;
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
      // Simulate Laravel 422 Validation Error handling
      if (error.status === 422) {
        setErrors(error.data.errors);
      }
      options?.onError?.(error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, errors, setErrors };
}
