import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

export function VerifyPayment() {
    const { courseId } = useParams();  // Get courseId from URL params
    const navigate = useNavigate();
    const location = useLocation();  // Get location to access query parameters

    // Helper function to extract query parameters
    const getQueryParams = (search) => {
        return new URLSearchParams(search);
    };

    useEffect(() => {
        const verifyPayment = async () => {
            const queryParams = getQueryParams(location.search);
            const trxref = queryParams.get('trxref');
            const reference = queryParams.get('reference');

            try {
                // Call your backend to verify the payment
                const response = await axios.get(`http://localhost:5001/verifypayment/${reference}`);
                console.log('Payment verification response:', response.data);

                if (response.data.message === 'Payment verified and user enrolled') {
                    navigate('/enrolled'); // Redirect to enrolled courses page
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        };

        verifyPayment();
    }, [courseId, location.search, navigate]);

    return (
        <div>
            <h1>Verifying Payment...</h1>
        </div>
    );
}
