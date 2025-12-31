import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Loader2 } from 'lucide-react';

interface AsyncSelectProps {
    endpoint: string;
    value?: string | number;
    onChange: (value: string) => void;
    valueKey?: string | ((item: any) => string);
    labelKey?: string | ((item: any) => string);
    placeholder?: string;
    className?: string;
    required?: boolean;
    disabled?: boolean;
    params?: Record<string, any>;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
    endpoint,
    value,
    onChange,
    valueKey = 'id',
    labelKey = 'name',
    placeholder = 'Select option',
    className = '',
    required = false,
    disabled = false,
    params = {},
}) => {
    const [options, setOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(endpoint, { params });
                let data = response.data?.data || response.data || [];

                // Handle Laravel pagination
                if (data && !Array.isArray(data) && Array.isArray(data.data)) {
                    data = data.data;
                }

                setOptions(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError('Failed to load options');
                console.error('AsyncSelect error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOptions();
    }, [endpoint, JSON.stringify(params)]);

    const getValue = (item: any) => {
        return typeof valueKey === 'function' ? valueKey(item) : item[valueKey];
    };

    const getLabel = (item: any) => {
        return typeof labelKey === 'function' ? labelKey(item) : item[labelKey];
    };

    return (
        <div className="relative">
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-brand-primary font-bold text-sm ${className}`}
                required={required}
                disabled={disabled || isLoading}
            >
                <option value="">
                    {isLoading ? 'Loading...' : error ? 'Failed to load' : placeholder}
                </option>
                {!isLoading && !error && options.map((item, index) => (
                    <option key={index} value={getValue(item)}>
                        {getLabel(item)}
                    </option>
                ))}
            </select>
            {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Loader2 size={16} className="animate-spin text-brand-primary" />
                </div>
            )}
        </div>
    );
};
