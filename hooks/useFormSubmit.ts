
import { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface FormSubmitOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
}

export function useFormSubmit(submitFn: (data: any) => Promise<any>, options?: FormSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { showNotification } = useNotification();

  const submit = async (formData: any) => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const result = await submitFn(formData);
      showNotification(options?.successMessage || "Operation completed successfully!", 'success');
      options?.onSuccess?.(result);
      return { success: true, data: result };
    } catch (error: any) {
      const apiResponse = error.originalError?.response;
      if (apiResponse?.status === 422 && apiResponse.data?.errors) {
        setErrors(apiResponse.data.errors);
        showNotification("Please check the form for validation errors.", 'error');
      } else {
        showNotification(error.message || "A system error occurred. Please try again.", 'error');
      }
      options?.onError?.(error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, errors, setErrors };
}
