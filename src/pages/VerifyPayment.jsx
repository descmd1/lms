import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../components/ThemeContext';

export function VerifyPayment() {
    const { courseId } = useParams(); 
    const navigate = useNavigate();
    const location = useLocation();  

        const {theme} = useTheme();
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
                    navigate('/enrolled'); 
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
            }
        };

        verifyPayment();
    }, [courseId, location.search, navigate]);

    return (
        <div className={`app-container ${theme}`}>
            <h1>Verifying Payment...</h1>
        </div>
    );
}
