"use client";
import React, {useState, useEffect} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import './CheckoutForm.css';
import {useFormState} from "react-dom";
import {type CartEntityResponse} from "@epcc-sdk/sdks-shopper";

const initialState = {
    message: '',
}

interface CheckoutFormProps {
    userData?: any;
    isAuthenticated: boolean;
    cart: CartEntityResponse;
}

export default function CheckoutForm({ userData, isAuthenticated, cart }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer: {
            email: userData?.email || '',
            name: userData?.name || ''
        },
        billingAddress: {
            first_name: userData?.name?.split(' ')[0] || '',
            last_name: userData?.name?.split(' ').slice(1).join(' ') || '',
            line_1: '',
            line_2: '',
            city: '',
            region: '',
            postcode: '',
            country: ''
        }
    });
    const [formErrors, setFormErrors] = useState<any>({});

    const handleError = (error: any) => {
        setLoading(false);
        setErrorMessage(error.message);
    }

    const handleInputChange = (field: string, value: string) => {
        const [section, key] = field.split('.');
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [key]: value
            }
        }));
        
        if (formErrors[field]) {
            setFormErrors((prev: any) => {
                const newErrors = {...prev};
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Check if cart has subscription items
    const hasSubscriptionItems = cart.data.relationships?.items?.data?.some((item: any) => {
        // You may need to check the actual cart items for subscription type
        return false; // Placeholder - implement based on your cart structure
    });

    const validateForm = () => {
        const errors: any = {};
        
        // Only require email and name if not authenticated and has subscription items
        if (!isAuthenticated && hasSubscriptionItems) {
            if (!formData.customer.email) {
                errors['customer.email'] = 'Email is required for subscription items';
            } else if (!/\S+@\S+\.\S+/.test(formData.customer.email)) {
                errors['customer.email'] = 'Email is invalid';
            }
            
            if (!formData.customer.name) {
                errors['customer.name'] = 'Name is required for subscription items';
            }
        }
        
        if (!formData.billingAddress.first_name) {
            errors['billingAddress.first_name'] = 'First name is required';
        }
        
        if (!formData.billingAddress.last_name) {
            errors['billingAddress.last_name'] = 'Last name is required';
        }
        
        if (!formData.billingAddress.line_1) {
            errors['billingAddress.line_1'] = 'Address is required';
        }
        
        if (!formData.billingAddress.city) {
            errors['billingAddress.city'] = 'City is required';
        }
        
        if (!formData.billingAddress.postcode) {
            errors['billingAddress.postcode'] = 'Postal code is required';
        }
        
        if (!formData.billingAddress.country) {
            errors['billingAddress.country'] = 'Country is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!stripe) {
            return;
        }

        if (!elements) {
            return;
        }

        setLoading(true);

        const {error: submitError} = await elements.submit();
        if (submitError) {
            handleError(submitError);
            return;
        }

        const {error, confirmationToken} = await stripe.createConfirmationToken({
            elements,
        });

        if (error) {
            handleError(error);
            return;
        }

        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                confirmationTokenId: confirmationToken.id,
                customer: formData.customer,
                billingAddress: formData.billingAddress
            }),
        });

        const data = await res.json();
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-sections">
                {isAuthenticated && (
                    <div className="logged-in-message">
                        <p>Logged in as: <strong>{userData?.email}</strong></p>
                    </div>
                )}
                
                <section className="form-section">
                    <h2>Customer Information</h2>
                    {(!isAuthenticated || hasSubscriptionItems) && (
                        <>
                            <div className="form-group">
                                <label htmlFor="email">
                                    Email {!isAuthenticated && hasSubscriptionItems ? '*' : ''}
                                </label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={formData.customer.email}
                                    onChange={(e) => handleInputChange('customer.email', e.target.value)}
                                    className={formErrors['customer.email'] ? 'invalid' : ''}
                                    placeholder="john@example.com"
                                    readOnly={isAuthenticated}
                                />
                                {formErrors['customer.email'] && (
                                    <span className="error-message">{formErrors['customer.email']}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">
                                    Full Name {!isAuthenticated && hasSubscriptionItems ? '*' : ''}
                                </label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    value={formData.customer.name}
                                    onChange={(e) => handleInputChange('customer.name', e.target.value)}
                                    className={formErrors['customer.name'] ? 'invalid' : ''}
                                    placeholder="John Doe"
                                    readOnly={isAuthenticated}
                                />
                                {formErrors['customer.name'] && (
                                    <span className="error-message">{formErrors['customer.name']}</span>
                                )}
                            </div>
                        </>
                    )}
                </section>

                <section className="form-section">
                    <h2>Billing Address</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="billingFirstName">First Name *</label>
                            <input 
                                type="text" 
                                id="billingFirstName" 
                                value={formData.billingAddress.first_name}
                                onChange={(e) => handleInputChange('billingAddress.first_name', e.target.value)}
                                className={formErrors['billingAddress.first_name'] ? 'invalid' : ''}
                            />
                            {formErrors['billingAddress.first_name'] && (
                                <span className="error-message">{formErrors['billingAddress.first_name']}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="billingLastName">Last Name *</label>
                            <input 
                                type="text" 
                                id="billingLastName" 
                                value={formData.billingAddress.last_name}
                                onChange={(e) => handleInputChange('billingAddress.last_name', e.target.value)}
                                className={formErrors['billingAddress.last_name'] ? 'invalid' : ''}
                            />
                            {formErrors['billingAddress.last_name'] && (
                                <span className="error-message">{formErrors['billingAddress.last_name']}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="billingLine1">Address *</label>
                        <input 
                            type="text" 
                            id="billingLine1" 
                            value={formData.billingAddress.line_1}
                            onChange={(e) => handleInputChange('billingAddress.line_1', e.target.value)}
                            className={formErrors['billingAddress.line_1'] ? 'invalid' : ''}
                            placeholder="123 Main St"
                        />
                        {formErrors['billingAddress.line_1'] && (
                            <span className="error-message">{formErrors['billingAddress.line_1']}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="billingLine2">Apartment, suite, etc. (optional)</label>
                        <input 
                            type="text" 
                            id="billingLine2" 
                            value={formData.billingAddress.line_2}
                            onChange={(e) => handleInputChange('billingAddress.line_2', e.target.value)}
                            placeholder="Apt 4B"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="billingCity">City *</label>
                            <input 
                                type="text" 
                                id="billingCity" 
                                value={formData.billingAddress.city}
                                onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                                className={formErrors['billingAddress.city'] ? 'invalid' : ''}
                            />
                            {formErrors['billingAddress.city'] && (
                                <span className="error-message">{formErrors['billingAddress.city']}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="billingRegion">State/Province</label>
                            <input 
                                type="text" 
                                id="billingRegion" 
                                value={formData.billingAddress.region}
                                onChange={(e) => handleInputChange('billingAddress.region', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="billingPostcode">Postal Code *</label>
                            <input 
                                type="text" 
                                id="billingPostcode" 
                                value={formData.billingAddress.postcode}
                                onChange={(e) => handleInputChange('billingAddress.postcode', e.target.value)}
                                className={formErrors['billingAddress.postcode'] ? 'invalid' : ''}
                            />
                            {formErrors['billingAddress.postcode'] && (
                                <span className="error-message">{formErrors['billingAddress.postcode']}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="billingCountry">Country *</label>
                            <input 
                                type="text" 
                                id="billingCountry" 
                                value={formData.billingAddress.country}
                                onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                                className={formErrors['billingAddress.country'] ? 'invalid' : ''}
                                placeholder="US"
                            />
                            {formErrors['billingAddress.country'] && (
                                <span className="error-message">{formErrors['billingAddress.country']}</span>
                            )}
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>Payment Information</h2>
                    <PaymentElement />
                </section>
            </div>

            <button type="submit" disabled={!stripe || loading} className="btn btn-primary btn-block">
                {loading ? 'Processing...' : 'Complete Order'}
            </button>
            
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
    );
}
