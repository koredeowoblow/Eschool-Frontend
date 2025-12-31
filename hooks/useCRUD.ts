import { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

interface UseCRUDOptions {
    onSuccess?: (data?: any) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
}

export const useCRUD = <T = any>(baseEndpoint: string, options: UseCRUDOptions = {}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    const create = async (data: Partial<T>) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post(baseEndpoint, data);
            showNotification(
                options.successMessage || 'Created successfully',
                'success'
            );
            options.onSuccess?.(response.data);
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || options.errorMessage || 'Failed to create';
            setError(message);
            showNotification(message, 'error');
            options.onError?.(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const update = async (id: string | number, data: Partial<T>) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.put(`${baseEndpoint}/${id}`, data);
            showNotification(
                options.successMessage || 'Updated successfully',
                'success'
            );
            options.onSuccess?.(response.data);
            return response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || options.errorMessage || 'Failed to update';
            setError(message);
            showNotification(message, 'error');
            options.onError?.(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const remove = async (id: string | number) => {
        setIsLoading(true);
        setError(null);
        try {
            await api.delete(`${baseEndpoint}/${id}`);
            showNotification('Deleted successfully', 'success');
            options.onSuccess?.();
            return true;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to delete';
            setError(message);
            showNotification(message, 'error');
            options.onError?.(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const get = async (id: string | number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`${baseEndpoint}/${id}`);
            return response.data.data || response.data;
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch';
            setError(message);
            options.onError?.(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const list = async (params?: Record<string, any>) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(baseEndpoint, { params });
            const data = response.data.data || response.data;
            // Handle Laravel pagination
            if (data && !Array.isArray(data) && Array.isArray(data.data)) {
                return data.data;
            }
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to fetch list';
            setError(message);
            options.onError?.(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        create,
        update,
        remove,
        get,
        list,
        isLoading,
        error,
    };
};
