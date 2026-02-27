import { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';

export default function OAuthCallback() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const email = queryParams.get('email');
        const firstName = queryParams.get('firstName');
        const lastName = queryParams.get('lastName');
        const role = queryParams.get('role');
        const userId = queryParams.get('userId');

        if (token && email) {
            const userData = { email, firstName, lastName, role, id: userId };
            login(userData, token);
            toast.success('Successfully logged in with OAuth!');
            navigate(role === 'ADMIN' ? '/admin/products' : '/products');
        } else {
            toast.error('OAuth login failed.');
            navigate('/login');
        }
    }, [location, login, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in" style={{ background: '#000000' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 border border-white/20 animate-pulse">
                <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
            <p className="text-slate-400 text-sm">Please wait while we log you in securely.</p>
        </div>
    );
}
